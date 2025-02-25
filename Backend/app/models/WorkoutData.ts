import { IUser, IWorkout } from "@paciorekj/iron-journal-shared";
import mongoose, { Schema } from "mongoose";
import { ISetData } from "./SetData";

export const WORKOUT_DATA_STATUS = {
    ACTIVE: "Active",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
};

export type WORKOUT_DATA_STATUS =
    (typeof WORKOUT_DATA_STATUS)[keyof typeof WORKOUT_DATA_STATUS];

export interface IWorkoutData extends Document {
    userId: IUser["_id"];
    workout: IWorkout["_id"] | null;
    setsData: ISetData["_id"][];
    status: WORKOUT_DATA_STATUS;
    createdAt: Date;
    updatedAt: Date;
}

const WorkoutDataSchema = new Schema<IWorkoutData>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        workout: {
            type: Schema.Types.ObjectId,
            ref: "Workout",
            default: null,
        },
        setsData: [
            {
                type: Schema.Types.ObjectId,
                ref: "SetData",
            },
        ],
        status: {
            type: String,
            enum: Object.keys(WORKOUT_DATA_STATUS),
            default: "ACTIVE",
        },
    },
    { timestamps: true },
);

export const WorkoutData = mongoose.model<IWorkoutData>(
    "WorkoutData",
    WorkoutDataSchema,
);
