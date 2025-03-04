import { SET_TYPE } from "@paciorekj/iron-journal-shared";
import { User } from "@paciorekj/iron-journal-shared/models/user";
import { ServiceResult } from "~/interfaces/service-result";
import { IDailyData } from "~/models/DailyData";
import { IOneRepMaxData } from "~/models/OneRepMaxData";
import { ISetData } from "~/models/SetData";
import { IWorkoutData } from "~/models/WorkoutData";

function calculateXP(level: number) {
    return Math.floor(1500 * Math.pow(level, 1.5)); // Scales XP per level
}

export const XP_AWARDS = {
    COMPLETE_WORKOUT: 1672, // Compete a workout in workoutData, set the status to completed
    COMPLETE_SET: 624, // Create a SetData that is not a rest set
    COMPLETE_REST_SET: 125, // Create a SetData that is a rest set, type = REST_SET, lower XP for this
    COMPLETE_CARDIO_SET: 1500, // Create a SetData that is a cardio set
    COMPLETE_DAILY_DATA_FIELD: 125, // Add a daily data field, for each that went from undefined or nothing give XP
    COMPLETE_ONE_REP_MAX: 782, // Log a one rep max
};

export enum XPRewardType {
    COMPLETE_WORKOUT = "COMPLETE_WORKOUT",
    COMPLETE_SET = "COMPLETE_SET",
    COMPLETE_REST_SET = "COMPLETE_REST_SET",
    COMPLETE_CARDIO_SET = "COMPLETE_CARDIO_SET",
    COMPLETE_DAILY_FIELD = "COMPLETE_DAILY_FIELD",
    COMPLETE_ONE_REP_MAX = "COMPLETE_ONE_REP_MAX",
}

const REWARD_XP: Record<XPRewardType, number> = {
    [XPRewardType.COMPLETE_WORKOUT]: 1672,
    [XPRewardType.COMPLETE_SET]: 624,
    [XPRewardType.COMPLETE_REST_SET]: 125,
    [XPRewardType.COMPLETE_CARDIO_SET]: 1500,
    [XPRewardType.COMPLETE_DAILY_FIELD]: 125,
    [XPRewardType.COMPLETE_ONE_REP_MAX]: 782,
};

type RewardCounterFunction = (oldData: any, newData: any) => number;

function getRewardFunction(type: XPRewardType): RewardCounterFunction {
    const REWARD_COUNTER: Record<XPRewardType, RewardCounterFunction> = {
        [XPRewardType.COMPLETE_WORKOUT]: (
            oldWorkout: IWorkoutData,
            newWorkout: IWorkoutData,
        ) =>
            oldWorkout.status !== "completed" &&
            newWorkout.status === "completed"
                ? REWARD_XP[type]
                : 0,

        [XPRewardType.COMPLETE_SET]: (set: ISetData) =>
            set.type !== SET_TYPE.REST_SET ? REWARD_XP[type] : 0,

        [XPRewardType.COMPLETE_REST_SET]: (set: ISetData) =>
            set.type === SET_TYPE.REST_SET ? REWARD_XP[type] : 0,

        [XPRewardType.COMPLETE_CARDIO_SET]: (set: ISetData) =>
            set.type === SET_TYPE.CARDIO_SET ? REWARD_XP[type] : 0,

        [XPRewardType.COMPLETE_DAILY_FIELD]: (
            oldData: IDailyData,
            newData: IDailyData,
        ) =>
            Object.keys(newData).reduce((count, k) => {
                const key = k as keyof IDailyData;
                if (!oldData[key] && newData[key]) count++;
                return count;
            }, 0) * REWARD_XP[type],

        [XPRewardType.COMPLETE_ONE_REP_MAX]: (
            oldData: IOneRepMaxData,
            newData: IOneRepMaxData,
        ) => (oldData.weight < newData.weight ? REWARD_XP[type] : 0),
    };

    return REWARD_COUNTER[type] ?? (() => 0);
}

export async function addXP(
    response: ServiceResult<any>,
    userId: string,
    earnedXP: number,
): Promise<ServiceResult<any>> {
    const user = await User.findById(userId);

    if (!user) throw new Error("User not found");

    if (earnedXP <= 0) throw new Error("Cannot add negative xp");

    const oldLevel = user.level;
    const oldXp = user.xp;

    user.xp += earnedXP;
    let requiredXP = calculateXP(user.level);
    let leveledUp = false;

    while (user.xp >= requiredXP) {
        user.xp -= requiredXP;
        user.level += 1;
        leveledUp = true;
        requiredXP = calculateXP(user.level);
    }

    await user.save();

    return {
        ...response,
        leveling: {
            oldLevel,
            newLevel: user.level,
            oldXp,
            newXP: user.xp,
            leveledUp,
            xpEarned: earnedXP,
            message: leveledUp
                ? `You have leveled up to level ${user.level}!`
                : undefined,
        },
    };
}

// Observer for Rewarding XP potentially for an action performed or unlocking a achievement (Last one to trigger?), observer for achievements (Marks as completed, in which it would notify reward XP, or it updates progress), observer for challenges (Marks as completed, in which it would notify reward XP, or it updates progress)

// *** Achievements & Same for Challenges *** -> Inform the XP Rewarder on competition
// updateProgress -> criteria, value -> updateProgress of achievement for user
// getUserProgress
// getRequiredProgress
// markAsCompleted

// Achievements

/**
 * Challenge
 *
 * - Name
 * - Description
 * - Trigger -> UPDATE_WORKOUT_DATA?, CREATE_SET? or would COMPLETE_SET be better? or should it reflect the servers activities (CREATE/UPDATE_SET) or user activities (COMPLETE_SET)?
 * - Collection -> workoutData | SetData, we could use a map to map the collections
 * - Requirements: { // NOTE: Many achievements/challenges are based on a setData and or workoutData that has been created/updated
 *    - totalCount -> workoutData.count({})
 *    - numberOfSets -> newWorkoutData/updatedWorkoutData.setData.length
 *    - duration -> setData.duration || setData.setData.map((s) => s.duration) || (workoutDate.updatedAt - workoutData.createdAt) > 7200000 aka 2 hour long workout
 *    - distance -> setData.distance
 *    - weight   -> setData.weight || setData.setData.map((s) => s.weight)
 *    - reps     -> setData.reps || setData.setData.map((s) => s.reps)
 *    - isCompleted -> The workout is in a complete state
 *    - exerciseId -> Specific exercise to do
 * }
 * - Value
 * - Start Date
 * - End Date
 *
 */

/**
 * Achievement
 *
 * - Name
 * - Description
 * - Criteria
 * - Value
 *
 */

/**
 * Action
 *
 * ??? complete a Set
 */

/**
 * Rewards
 *
 * - Type (Achievement, Challenge, Action)
 * - isCompleted
 */
