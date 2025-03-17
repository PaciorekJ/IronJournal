import { User } from "@paciorekj/iron-journal-shared";
import UserXpLog from "~/models/UserXpLogger";

export const AwardXpActions = {
    completeDailyDataField: { xp: 5, limit: 5 },
    completeOneRepMax: { xp: 30, limit: 1 },
    completeWorkout: { xp: 10, limit: 3 },
    completeSet: { xp: 5, limit: 50 },
    createWorkoutSchedule: { xp: 10, limit: 1 },
    createProgramSchedule: { xp: 15, limit: 1 },
} as const;

type actionsType = keyof typeof AwardXpActions;

const levelUpFormula = (level: number) => {
    return Math.round(100 * 1.12 ** (level - 1));
};

const getUserLocalMidnight = (timeZone: string) => {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    const [month, day, year] = formatter.format(now).split("/");
    const localMidnight = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

    return localMidnight;
};

export const awardXp = async (userId: string, action: actionsType) => {
    const user = await User.findById(userId);
    if (!user)
        throw new Response(
            `User not found, cannot award XP - ${userId} ${action}`,
            { status: 404 },
        );

    const { xp, limit } = AwardXpActions[action];

    const timeZone = user.timezone || "UTC";
    const localMidnightUTC = getUserLocalMidnight(timeZone);

    const actionsToday = await UserXpLog.countDocuments({
        userId,
        action,
        timestamp: { $gte: localMidnightUTC },
    });

    if (actionsToday >= limit) {
        return { newLevel: user.level, remainingXp: user.xp };
    }

    user.xp = (user.xp ?? 0) + xp;

    while (user.xp >= levelUpFormula(user.level)) {
        user.xp -= levelUpFormula(user.level);
        user.level += 1;
    }

    await user.save();

    await UserXpLog.create({ userId, action, xpAwarded: xp });

    return { newLevel: user.level, remainingXp: user.xp };
};
