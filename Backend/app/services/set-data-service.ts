import { IUser } from "@paciorekj/iron-journal-shared";
import { ServiceResult } from "~/interfaces/service-result";
import SetData, { ISetData } from "~/models/SetData";
import { WorkoutData } from "~/models/WorkoutData";
import { handleError } from "~/utils/util.server";

export const deleteSetData = async (
    user: IUser,
    workoutId: string,
    setId: string,
): Promise<ServiceResult<undefined>> => {
    try {
        // Find and update the workout data to remove the set
        const result = await WorkoutData.updateOne(
            { userId: user._id, workout: workoutId },
            { $pull: { sets: setId } },
        );

        if (result.modifiedCount === 0) {
            throw new Error("WorkoutData or SetData not found for this user");
        }

        // Optionally delete the set itself
        await SetData.findByIdAndDelete(setId);

        return {
            message: "SetData deleted successfully and WorkoutData updated",
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const createSetData = async (
    user: IUser,
    workoutId: string,
    setData: ISetData,
): Promise<ServiceResult<ISetData>> => {
    try {
        // Create the new set
        const newSet = await SetData.create(setData);

        // Add the set to the user's workout data
        const updatedWorkoutData = await WorkoutData.findOneAndUpdate(
            { userId: user._id, workout: workoutId },
            { $push: { sets: newSet._id } },
            { new: true, runValidators: true },
        );

        if (!updatedWorkoutData) {
            throw new Error("WorkoutData not found for this user");
        }

        return {
            message: "SetData created successfully and added to WorkoutData",
            data: newSet,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const updateSetData = async (
    user: IUser,
    workoutId: string,
    setId: string,
    setDataUpdates: Partial<ISetData>,
): Promise<ServiceResult<ISetData>> => {
    try {
        // Ensure the set belongs to the user and workout
        const workoutData = await WorkoutData.findOne({
            userId: user._id,
            workout: workoutId,
            sets: setId,
        });

        if (!workoutData) {
            throw new Error("WorkoutData or SetData not found for this user");
        }

        // Update the set
        const updatedSet = await SetData.findByIdAndUpdate(
            setId,
            setDataUpdates,
            {
                new: true,
                runValidators: true,
            },
        );

        if (!updatedSet) {
            throw new Error("SetData update failed");
        }

        return {
            message: "SetData updated successfully",
            data: updatedSet,
        };
    } catch (error) {
        throw handleError(error);
    }
};
