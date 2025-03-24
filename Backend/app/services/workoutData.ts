import { IUser } from "@paciorekj/iron-journal-shared";
import mongoose from "mongoose";
import { ServiceResult } from "~/interfaces/service-result";
import { localizeWorkoutData } from "~/localization/WorkoutData";
import SetData, { ISetData } from "~/models/SetData";
import {
    IWorkoutData,
    WORKOUT_DATA_STATUS,
    WorkoutData,
} from "~/models/WorkoutData";
import {
    buildPopulateOptions,
    buildQueryFromSearchParams,
} from "~/queryConfig/utils";
import { workoutDataQueryConfig } from "~/queryConfig/workoutData";
import { handleError } from "~/utils/util.server";
import {
    IWorkoutDataCreateDTO,
    IWorkoutDataUpdateDTO,
} from "~/validation/workoutData";
import { awardXp } from "./awardXp";
import { denormalizeSetData, ISetDataDenormalized } from "./setData";

export interface IWorkoutDataDenormalized
    extends Omit<IWorkoutData, "setsData"> {
    setsData: ISetData["_id"][] | ISetDataDenormalized[];
}

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
): Promise<ServiceResult<IWorkoutDataDenormalized[]>> => {
    try {
        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams<IWorkoutData>(
                searchParams,
                workoutDataQueryConfig,
            );

        query.userId = user._id;

        const sortOption: Record<string, 1 | -1> | undefined = sortBy
            ? { [sortBy]: sortOrder as 1 | -1 }
            : undefined;

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

        // In the event that setData is populated we must de-normalized them
        const normalizedWorkoutData: IWorkoutDataDenormalized[] =
            localizedWorkoutData.map((workout) => ({
                ...workout,
                setsData: workout.setsData.map((setData) =>
                    typeof setData === "object"
                        ? denormalizeSetData(
                              setData as ISetData,
                              user.measurementSystemPreference,
                          )
                        : setData,
                ),
            }));

        return {
            message: "WorkoutData retrieved successfully",
            data: normalizedWorkoutData,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const getWorkoutDataById = async (
    user: IUser,
    workoutId: string,
    searchParams: URLSearchParams,
): Promise<ServiceResult<IWorkoutDataDenormalized>> => {
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

        const denormalizedWorkoutData: IWorkoutDataDenormalized = {
            ...localizedWorkoutData,
            setsData: localizedWorkoutData.setsData.map((setData) =>
                typeof setData === "object"
                    ? denormalizeSetData(
                          setData as ISetData,
                          user.measurementSystemPreference,
                      )
                    : setData,
            ),
        };

        return {
            message: "WorkoutData retrieved successfully",
            data: denormalizedWorkoutData,
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

        if (
            updatedWorkout.setsData.length > 0 &&
            updatedWorkout.status === WORKOUT_DATA_STATUS.COMPLETED
        ) {
            const leveling = await awardXp(
                user._id.toString(),
                "completeWorkout",
            );

            return {
                message: "WorkoutData updated successfully",
                data: updatedWorkout as IWorkoutData,
                leveling,
            };
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
