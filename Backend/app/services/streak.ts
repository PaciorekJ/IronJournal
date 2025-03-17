import { IUser } from "@paciorekj/iron-journal-shared";
import { StreakConfig } from "~/config/streaks";
import { getUserLocalMidnight } from "~/utils/util.server";

/**
 * Formats streak progress for frontend display.
 * @param streakCount - The user's current streak count.
 * @returns An object containing the current streak, next milestone, XP multiplier, and progress percentage.
 */
const formatStreakData = (streakCount: number) => {
    const milestones = Object.keys(StreakConfig.streakMultiplier)
        .map(Number)
        .sort((a, b) => a - b);

    const currentMilestone =
        milestones.filter((m) => m <= streakCount).pop() || 0;

    const nextMilestone = milestones.find((m) => m > streakCount) || null;

    const currentMultiplier = StreakConfig.streakMultiplier[currentMilestone];

    const progressToNext = nextMilestone
        ? (streakCount / nextMilestone) * 100
        : 100;

    return {
        currentStreak: streakCount,
        xpMultiplier: currentMultiplier,
        nextMilestone, // Next streak milestone (null if none)
        progressToNext, // Percentage progress toward next milestone
    };
};

/**
 * Updates the user's streak count based on their last activity date using the user's timezone.
 * @param user - The user object (should already be fetched from the DB).
 * @returns Frontend-friendly streak progress data.
 */
export const updateUserStreak = async (user: IUser) => {
    if (!user) throw new Error("User not found");

    const timeZone = user.timezone || "UTC";

    const today = getUserLocalMidnight(timeZone);

    const lastUpdatedStr = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(user.streak.lastUpdated));
    const [month, day, year] = lastUpdatedStr.split("/");
    const lastUpdated = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

    const dayDifference =
        (today.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

    if (dayDifference === 0) {
        return formatStreakData(user.streak.count);
    }

    if (dayDifference <= StreakConfig.streakResetDays) {
        user.streak.count += 1;
    } else {
        user.streak.count = 1;
    }

    user.streak.lastUpdated = new Date();
    await user.save();

    return formatStreakData(user.streak.count);
};
