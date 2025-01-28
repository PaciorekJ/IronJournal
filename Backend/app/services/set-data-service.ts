import { IUser } from "@paciorekj/iron-journal-shared";
import { data } from "@remix-run/node";
import mongoose from "mongoose";
import { ServiceResult } from "~/interfaces/service-result";
import SetData, { ISetData } from "~/models/SetData";
import { WorkoutData } from "~/models/WorkoutData";
import { handleError } from "~/utils/util.server";
import { ISetDataCreateDTO, ISetDataUpdateDTO } from "~/validation/setData";

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
        );

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
        });

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

        const newSet = await SetData.create(setData);

        const { modifiedCount } = await WorkoutData.updateOne(
            { userId: user._id, _id: workoutId },
            { $push: { setsData: newSet._id } },
            { runValidators: true },
        );

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
