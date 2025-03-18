import { User } from "@paciorekj/iron-journal-shared";
import mongoose from "mongoose";
import UserXpLog from "~/models/UserXpLogger";
import { getUserLocalMidnight } from "~/utils/util.server";
import { updateUserStreak } from "./streak";

export const AwardXpActions = {
    completeDailyDataField: { xp: 5, limit: 5 },
    completeOneRepMax: { xp: 30, limit: 1 },
    completeOneRepMaxAttempt: { xp: 10, limit: 5 },
    completeWorkout: { xp: 10, limit: 3 },
    completeSet: { xp: 5, limit: 50 },
    createWorkoutSchedule: { xp: 10, limit: 1 },
    createProgramSchedule: { xp: 15, limit: 1 },
} as const;

type actionsType = keyof typeof AwardXpActions;

const levelUpFormula = (level: number) => {
    return Math.round(100 * 1.12 ** (level - 1));
};

export const awardXp = async (
    userId: string,
    action: actionsType,
    count = 1,
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new Response(
                `User not found, cannot award XP - ${userId} ${action}`,
                { status: 404 },
            );
        }

        const streakData = await updateUserStreak(user);

        const { xp, limit } = AwardXpActions[action];
        const timeZone = user.timezone || "UTC";
        const localMidnightUTC = getUserLocalMidnight(timeZone);

        const actionsToday = await UserXpLog.countDocuments({
            userId,
            action,
            timestamp: { $gte: localMidnightUTC },
        }).session(session);

        const remaining = Math.max(0, limit - actionsToday);
        const actualAwardCount = Math.min(count, remaining);

        if (actualAwardCount === 0) {
            await session.abortTransaction();
            session.endSession();
            return {
                newLevel: user.level,
                remainingXp: user.xp,
                streak: streakData,
            };
        }

        const baseXp = actualAwardCount * xp;
        const totalXp = Math.round(baseXp * streakData.xpMultiplier);

        user.xp = (user.xp ?? 0) + totalXp;
        user.level = user.level ?? 1;

        let xpThreshold = levelUpFormula(user.level);
        while (user.xp >= xpThreshold) {
            user.xp -= xpThreshold;
            user.level += 1;
            xpThreshold = levelUpFormula(user.level);
        }

        await user.save({ session });

        const xpLogs = Array.from({ length: actualAwardCount }).map(() => ({
            userId,
            action,
            xpAwarded: xp,
        }));
        await UserXpLog.insertMany(xpLogs, { session });

        await session.commitTransaction();
        session.endSession();

        return {
            newLevel: user.level,
            remainingXp: user.xp,
            streak: streakData,
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
