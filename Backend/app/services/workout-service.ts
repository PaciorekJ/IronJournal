import mongoose from "mongoose";
import { ServiceResult } from "~/interfaces/service-result";
import { SetPrototype } from "~/models/set-prototype";
import { IUser } from "~/models/user";
import {
    IWorkoutPrototype,
    WorkoutPrototype,
} from "~/models/workout-prototype";
import {
    buildPopulateOptions,
    buildQueryFromSearchParams,
    IBuildQueryConfig,
} from "~/utils/util.server";
import {
    CreateWorkoutPrototypeInput,
    UpdateWorkoutPrototypeInput,
} from "~/validation/workout-prototype";

export const createWorkout = async (
    user: IUser,
    data: CreateWorkoutPrototypeInput,
): Promise<ServiceResult<{ workoutId: string }>> => {
    try {
        const { sets } = data;

        // Ensure all set IDs are valid and belong to the user
        const setIds: string[] = sets.map((setId: string) => setId.toString());

        const validSets = await SetPrototype.find({
            _id: { $in: setIds },
            userId: user._id,
        })
            .select("_id")
            .lean();

        const validSetIds = validSets.map((set) => set._id.toString());

        const invalidSets = setIds.filter((id) => !validSetIds.includes(id));
        if (invalidSets.length > 0) {
            return {
                status: 400,
                error: "Invalid set IDs provided",
                invalidSets,
            };
        }

        const newWorkout = await WorkoutPrototype.create({
            ...data,
            userId: user._id,
        });

        return {
            status: 201,
            message: "Workout created successfully",
            workoutId: newWorkout._id,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unexpected error occurred";
        return { status: 500, error: errorMessage };
    }
};

export const updateWorkout = async (
    user: IUser,
    workoutId: string,
    updateData: UpdateWorkoutPrototypeInput,
): Promise<ServiceResult<{ workoutId: string }>> => {
    if (!mongoose.isValidObjectId(workoutId)) {
        return { status: 400, error: "Workout ID is invalid" };
    }

    try {
        // Find the workout and ensure it belongs to the user
        const workout = await WorkoutPrototype.findOne({
            _id: workoutId,
            userId: user._id,
        });

        if (!workout) {
            return { status: 404, error: "Workout not found" };
        }

        // Update the workout
        Object.assign(workout, updateData);
        await workout.save();

        return {
            status: 200,
            message: "Workout updated successfully",
            workoutId: workout._id,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unexpected error occurred";
        return { status: 500, error: errorMessage };
    }
};

export const deleteWorkout = async (
    user: IUser,
    workoutId: string,
): Promise<ServiceResult<{ workoutId: string }>> => {
    if (!mongoose.isValidObjectId(workoutId)) {
        return { status: 400, error: "Workout ID is invalid" };
    }

    try {
        // Find the workout and ensure it belongs to the user
        const workout = await WorkoutPrototype.findOne({
            _id: workoutId,
            userId: user._id,
        });

        if (!workout) {
            return { status: 404, error: "Workout not found" };
        }

        // Delete all sets
        const setsToDelete = [
            ...workout.sets,
            workout.coolDown,
            workout.warmup,
        ];
        const workoutSetsValid = setsToDelete.filter((set) => set);
        await SetPrototype.deleteMany({ _id: { $in: workoutSetsValid } });

        // Delete the workout
        await workout.deleteOne();

        return {
            status: 200,
            message: "Workout deleted successfully",
            workoutId: workout._id,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unexpected error occurred";
        return { status: 500, error: errorMessage };
    }
};

export const readWorkouts = async (
    user: IUser,
    searchParams: URLSearchParams,
): Promise<ServiceResult<IWorkoutPrototype[]>> => {
    try {
        const queryConfig: IBuildQueryConfig = {
            name: {
                isArray: false,
                constructor: String,
                regex: (value: string) => new RegExp(value, "i"),
            },
            intensityLevel: {
                isArray: false,
                constructor: String,
                regex: (value: string) => new RegExp(value, "i"),
            },
        };

        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams(searchParams, queryConfig) as any;

        // Ensure the user can only see their own workouts
        query.userId = user._id;

        const sortOption: Record<string, 1 | -1> | null = sortBy
            ? { [sortBy]: sortOrder as 1 | -1 }
            : null;

        let queryObj = WorkoutPrototype.find(query)
            .sort(sortOption)
            .skip(offset)
            .limit(limit);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option: string | string[]) => {
            queryObj = queryObj.populate(option);
        });

        const workouts = await queryObj.lean();

        const totalCount = await WorkoutPrototype.countDocuments(query).exec();
        const hasMore = offset + workouts.length < totalCount;

        return { status: 200, data: workouts, hasMore };
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unexpected error occurred";
        return { status: 500, error: errorMessage };
    }
};

export const readWorkoutById = async (
    user: IUser,
    id: string,
    searchParams: URLSearchParams,
): Promise<ServiceResult<IWorkoutPrototype>> => {
    if (!id || !mongoose.isValidObjectId(id)) {
        return { status: 400, error: "Invalid or missing workout ID" };
    }

    try {
        let query = WorkoutPrototype.findById(id);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option) => {
            query = query.populate(option);
        });

        const workout = await query.lean();

        if (!workout) {
            return { status: 404, error: "Workout not found" };
        }

        // Check if the user has access to the workout
        if (workout.userId.toString() !== user._id) {
            return {
                status: 403,
                error: "Forbidden: You do not have access to this workout",
            };
        }

        return { status: 200, data: workout };
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unexpected error occurred";
        return { status: 500, error: errorMessage };
    }
};
