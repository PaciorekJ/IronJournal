import { IUser } from "@paciorekj/iron-journal-shared";
import { data } from "@remix-run/node";
import mongoose from "mongoose";
import { ServiceResult } from "~/interfaces/service-result";
import SetData, { ISetData, ISetDataEntry } from "~/models/SetData";
import { WorkoutData } from "~/models/WorkoutData";
import {
    deNormalizeDistance,
    deNormalizeWeight,
    IUnitsDistance,
    IUnitsWeight,
    normalizeDistance,
    normalizeWeight,
} from "~/utils/noramlizeUnits.server";
import { handleError } from "~/utils/util.server";
import { ISetDataCreateDTO, ISetDataUpdateDTO } from "~/validation/setData";
import { awardXp } from "./awardXp";

export interface ISetDataEntryDenormalized
    extends Omit<ISetDataEntry, "weight" | "distance" | "duration"> {
    weight: IUnitsWeight;
    distance?: IUnitsDistance;
}

export interface ISetDataDenormalized
    extends Omit<ISetData, "setData" | "weight"> {
    setData: ISetDataEntryDenormalized[];
    weight: IUnitsWeight;
}

export function normalizeSetData(
    setData: ISetDataCreateDTO | ISetDataUpdateDTO,
    measurementSystemPreference: IUser["measurementSystemPreference"],
): ISetData {
    const normalizedData = { ...setData } as ISetData;

    // *** Normalize Weight (if present) ***
    if ("weight" in setData && setData.weight) {
        normalizedData.weight = normalizeWeight(
            setData.weight,
            measurementSystemPreference,
        );
    }

    // *** Normalize Distance, Weight, and Duration in SetData Array ***
    if ("setData" in setData && setData.setData) {
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

            return updatedEntry;
        }) as ISetDataEntry[];
    }

    return normalizedData;
}

export function denormalizeSetData(
    setData: ISetData,
    measurementSystemPreference: IUser["measurementSystemPreference"],
): ISetDataDenormalized {
    const denormalizedData = { ...setData } as unknown as ISetDataDenormalized;

    // *** Denormalize Weight (if present) ***
    if (setData.weight) {
        denormalizedData.weight = setData.weight
            ? deNormalizeWeight(setData.weight, measurementSystemPreference)
            : { kg: 0, lb: 0 };
    }

    // *** Denormalize Distance, Weight, and Duration in SetData Array ***
    if (setData.setData) {
        denormalizedData.setData = setData.setData.map((entry) => {
            const updatedEntry = { ...entry } as ISetDataEntryDenormalized;

            // *** Denormalize Weight ***
            if ("weight" in entry && entry.weight) {
                updatedEntry.weight = entry.weight
                    ? deNormalizeWeight(
                          entry.weight,
                          measurementSystemPreference,
                      )
                    : { kg: 0, lb: 0 };
            }

            // *** Denormalize Distance ***
            if ("distance" in entry && entry.distance) {
                updatedEntry.distance = deNormalizeDistance(
                    entry.distance,
                    measurementSystemPreference,
                );
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
): Promise<ServiceResult<ISetDataDenormalized>> => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const normalizedSetData = normalizeSetData(
            setData,
            user.measurementSystemPreference,
        );

        const newSet = (
            await SetData.create([normalizedSetData], { session })
        )[0];

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

        if (modifiedCount >= 1) {
            const leveling = await awardXp(user._id.toString(), "completeSet");

            return {
                message:
                    "SetData created successfully and added to WorkoutData",
                data: denormalizeSetData(
                    newSet,
                    user.measurementSystemPreference,
                ),
                leveling,
            };
        }

        return {
            message: "SetData created successfully and added to WorkoutData",
            data: denormalizeSetData(newSet, user.measurementSystemPreference),
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
): Promise<ServiceResult<ISetDataDenormalized>> => {
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

        const normalizedSetData = normalizeSetData(
            setDataUpdates,
            user.measurementSystemPreference,
        );

        const updatedSet = await SetData.findByIdAndUpdate(
            setDataId,
            normalizedSetData,
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

        const denormalizedSetData = denormalizeSetData(
            updatedSet,
            user.measurementSystemPreference,
        );

        return {
            message: "SetData updated successfully",
            data: denormalizedSetData,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const readSetDataById = async (
    user: IUser,
    setDataId: string,
): Promise<ServiceResult<ISetDataDenormalized>> => {
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

        const denormalizedSetData = denormalizeSetData(
            setData,
            user.measurementSystemPreference,
        );

        return {
            message: "SetData found successfully",
            data: denormalizedSetData,
        };
    } catch (error) {
        throw handleError(error);
    }
};
