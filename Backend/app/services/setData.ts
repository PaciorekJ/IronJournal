import { IUser } from "@paciorekj/iron-journal-shared";
import { data } from "@remix-run/node";
import mongoose from "mongoose";
import { ServiceResult } from "~/interfaces/service-result";
import SetData, { ISetData, ISetDataEntry } from "~/models/SetData";
import { WorkoutData } from "~/models/WorkoutData";
import {
    deNormalizeDistance,
    deNormalizeWeight,
    normalizeDistance,
    normalizeWeight,
} from "~/utils/noramlizeUnits.server";
import { handleError } from "~/utils/util.server";
import { ISetDataCreateDTO, ISetDataUpdateDTO } from "~/validation/setData";

/**
 * @description
 * Normalize `ISetData` object by performing the following operations:
 * 1. Clone `setData` into `normalizedData`
 * 2. Normalize `weight` if present
 * 3. Normalize the following fields in `setData` array:
 *    a. `weight`
 *    b. `distance`
 *    c. `duration` (ensure non-negative)
 * @param {ISetDataCreateDTO | ISetDataUpdateDTO} setData
 * @param {IUser["measurementSystemPreference"]} measurementSystemPreference
 * @returns {ISetData}
 */
export function normalizeSetData(
    setData: ISetDataCreateDTO | ISetDataUpdateDTO,
    measurementSystemPreference: IUser["measurementSystemPreference"],
): ISetData {
    const normalizedData = { ...setData } as ISetData;

    // *** Normalize Weight (if present) ***
    if (setData.weight) {
        normalizedData.weight = normalizeWeight(
            setData.weight,
            measurementSystemPreference,
        );
    }

    // *** Normalize Distance, Weight, and Duration in SetData Array ***
    if (setData.setData) {
        normalizedData.setData = setData.setData.map((entry) => {
            const updatedEntry = { ...entry } as ISetDataEntry;

            // *** Normalize Weight ***
            if ("weight" in entry && entry.weight) {
                updatedEntry.weight = normalizeWeight(
                    entry.weight,
                    measurementSystemPreference,
                );
            }

            // *** Normalize Distance ***
            if ("distance" in entry && entry.distance) {
                updatedEntry.distance = normalizeDistance(
                    entry.distance,
                    measurementSystemPreference,
                );
            }

            // *** Normalize Duration (Ensure non-negative) ***
            if ("duration" in entry && entry.duration !== undefined) {
                updatedEntry.duration = Math.max(0, entry.duration);
            }

            return updatedEntry;
        }) as ISetDataEntry[];
    }

    return normalizedData;
}

export function denormalizeSetData(
    setData: ISetData,
    measurementSystemPreference: IUser["measurementSystemPreference"],
): ISetDataCreateDTO | ISetDataUpdateDTO {
    const denormalizedData = { ...setData } as ISetDataCreateDTO;

    // *** Denormalize Weight (if present) ***
    if (setData.weight) {
        denormalizedData.weight = deNormalizeWeight(
            setData.weight,
            measurementSystemPreference,
        );
    }

    // *** Denormalize Distance, Weight, and Duration in SetData Array ***
    if (setData.setData) {
        denormalizedData.setData = setData.setData.map((entry) => {
            const updatedEntry = { ...entry } as any; // TODO: Refine Return typing for ISetDataEntry

            // *** Denormalize Weight ***
            if ("weight" in entry && entry.weight) {
                updatedEntry.weight = deNormalizeWeight(
                    entry.weight,
                    measurementSystemPreference,
                );
            }

            // *** Denormalize Distance ***
            if ("distance" in entry && entry.distance) {
                updatedEntry.distance = deNormalizeDistance(
                    entry.distance,
                    measurementSystemPreference,
                );
            }

            // *** Preserve Duration (Ensure non-negative remains) ***
            if ("duration" in entry && entry.duration !== undefined) {
                updatedEntry.duration = Math.max(0, entry.duration);
            }

            return updatedEntry;
        });
    }

    return denormalizedData;
}

export const deleteSetData = async (
    user: IUser,
    workoutDataId: string,
    setDataId: string,
): Promise<ServiceResult<undefined>> => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const updateWorkoutResult = await WorkoutData.updateOne(
            { userId: user._id, workout: workoutDataId },
            { $pull: { setsData: setDataId } },
        ).session(session);

        if (updateWorkoutResult.modifiedCount === 0) {
            throw data(
                {
                    error: "WorkoutData did not contain the setData specified",
                },
                { status: 404 },
            );
        }

        const deleteSetResult = await SetData.deleteOne({
            _id: setDataId,
            userId: user._id,
        }).session(session);

        if (deleteSetResult.deletedCount === 0) {
            throw data(
                {
                    error: "SetData not found for this user",
                },
                { status: 404 },
            );
        }

        await session.commitTransaction();
        await session.endSession();

        return {
            message: "SetData deleted successfully and WorkoutData updated",
        };
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        throw handleError(error);
    }
};

export const createSetData = async (
    user: IUser,
    workoutId: string,
    setData: ISetDataCreateDTO,
): Promise<ServiceResult<ISetData>> => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Normalize SetData weight, and setdata, etc...

        const newSet = (await SetData.create([setData], { session }))[0];

        const { modifiedCount } = await WorkoutData.updateOne(
            { userId: user._id, _id: workoutId },
            { $push: { setsData: newSet._id } },
            { runValidators: true },
        ).session(session);

        if (!modifiedCount) {
            throw data(
                {
                    error: "WorkoutData not found for this user",
                },
                { status: 404 },
            );
        }

        await session.commitTransaction();
        await session.endSession();

        return {
            message: "SetData created successfully and added to WorkoutData",
            data: newSet,
        };
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();

        throw handleError(error);
    }
};

export const updateSetData = async (
    user: IUser,
    workoutDataId: string,
    setDataId: string,
    setDataUpdates: ISetDataUpdateDTO,
): Promise<ServiceResult<ISetData>> => {
    try {
        const workoutData = await WorkoutData.exists({
            userId: user._id,
            _id: workoutDataId,
            setsData: setDataId,
        });

        if (!workoutData) {
            throw data(
                {
                    error: "WorkoutData not found for this user",
                },
                { status: 404 },
            );
        }

        const updatedSet = await SetData.findByIdAndUpdate(
            setDataId,
            setDataUpdates,
            {
                new: true,
                runValidators: true,
            },
        ).lean();

        if (!updatedSet) {
            throw data(
                {
                    error: "SetData not found for this user",
                },
                { status: 404 },
            );
        }

        return {
            message: "SetData updated successfully",
            data: updatedSet as ISetData,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const readSetDataById = async (
    user: IUser,
    setDataId: string,
): Promise<ServiceResult<ISetData>> => {
    try {
        const setData = await SetData.findById(setDataId).lean().exec();

        if (!setData) {
            throw data(
                {
                    error: "SetData not found",
                },
                { status: 404 },
            );
        }

        if (setData.userId.toString() !== user._id.toString()) {
            throw data(
                {
                    error: "You are not authorized to read this SetData",
                },
                { status: 403 },
            );
        }

        return {
            message: "SetData found successfully",
            data: setData as ISetData,
        };
    } catch (error) {
        throw handleError(error);
    }
};
