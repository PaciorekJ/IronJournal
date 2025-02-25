import { IUser } from "@paciorekj/iron-journal-shared";
import mongoose from "mongoose";
import { ServiceResult } from "~/interfaces/service-result";
import { localizeWorkoutData } from "~/localization/WorkoutData";
import SetData from "~/models/SetData";
import { IWorkoutData, WorkoutData } from "~/models/WorkoutData";
import {
    buildPopulateOptions,
    buildQueryFromSearchParams,
    workoutDataQueryConfig,
} from "~/utils/query.server";
import { handleError } from "~/utils/util.server";
import {
    IWorkoutDataCreateDTO,
    IWorkoutDataUpdateDTO,
} from "~/validation/workoutData";

export const createWorkoutData = async (
    user: IUser,
    workoutData: IWorkoutDataCreateDTO,
): Promise<ServiceResult<IWorkoutData>> => {
    try {
        const newWorkout = (
            await WorkoutData.create({
                ...workoutData,
                userId: user._id,
            })
        ).toObject();

        return {
            message: "WorkoutData created successfully",
            data: newWorkout as IWorkoutData,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const getAllWorkoutData = async (
    user: IUser,
    searchParams: URLSearchParams,
): Promise<ServiceResult<IWorkoutData[]>> => {
    try {
        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams<IWorkoutData>(
                searchParams,
                workoutDataQueryConfig,
            );

        query.userId = user._id;

        const sortOption = sortBy ? { [sortBy]: sortOrder as 1 | -1 } : null;

        let queryObj = WorkoutData.find(query)
            .sort(sortOption)
            .skip(offset)
            .limit(limit);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option) => {
            if (option.path === "workout") {
                queryObj = queryObj.populate({
                    path: "workout",
                    match: { $ne: null },
                });
            } else {
                queryObj = queryObj.populate(option);
            }
        });

        const workouts = await queryObj.lean().exec();

        const localizedWorkoutData = workouts.map((workout) =>
            localizeWorkoutData(
                workout as IWorkoutData,
                user.languagePreference,
            ),
        );

        return {
            message: "WorkoutData retrieved successfully",
            data: localizedWorkoutData as IWorkoutData[],
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const getWorkoutDataById = async (
    user: IUser,
    workoutId: string,
    searchParams: URLSearchParams,
): Promise<ServiceResult<IWorkoutData>> => {
    try {
        let queryObj = WorkoutData.findOne({
            _id: workoutId,
            userId: user._id,
        });

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option) => {
            if (option.path === "workout") {
                queryObj = queryObj.populate({
                    path: "workout",
                    match: { $ne: null },
                });
            } else {
                queryObj = queryObj.populate(option);
            }
        });

        const workout = await queryObj.lean().exec();

        if (!workout) {
            throw new Error("WorkoutData not found");
        }

        const localizedWorkoutData = localizeWorkoutData(
            workout as IWorkoutData,
            user.languagePreference,
        );

        return {
            message: "WorkoutData retrieved successfully",
            data: localizedWorkoutData as IWorkoutData,
        };
    } catch (error) {
        throw handleError(error);
    }
};

// Update a workout session
export const updateWorkoutData = async (
    user: IUser,
    workoutId: string,
    workoutDataUpdates: IWorkoutDataUpdateDTO,
): Promise<ServiceResult<IWorkoutData>> => {
    try {
        const updatedWorkout = await WorkoutData.findOneAndUpdate(
            { _id: workoutId, userId: user._id },
            workoutDataUpdates,
            { new: true, runValidators: true },
        ).lean();

        if (!updatedWorkout) {
            throw new Error("WorkoutData not found");
        }

        return {
            message: "WorkoutData updated successfully",
            data: updatedWorkout as IWorkoutData,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteWorkoutData = async (
    user: IUser,
    workoutId: string,
): Promise<ServiceResult<undefined>> => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const workout = await WorkoutData.findOneAndDelete({
            _id: workoutId,
            userId: user._id,
        }).session(session);

        if (!workout) {
            throw new Error("WorkoutData not found");
        }

        if (workout.setsData.length > 0) {
            const result = await SetData.deleteMany({
                _id: { $in: workout.setsData },
            }).session(session);

            const deletedCount = result.deletedCount ?? 0;
            if (deletedCount !== workout.setsData.length) {
                throw new Error("Some/all SetData were unable to be deleted");
            }
        }

        await session.commitTransaction();

        return {
            message: "WorkoutData and associated SetData deleted successfully",
        };
    } catch (error) {
        await session.abortTransaction();
        throw handleError(error);
    } finally {
        session.endSession();
    }
};
