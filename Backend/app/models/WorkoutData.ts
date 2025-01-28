import { IUser, IWorkout } from "@paciorekj/iron-journal-shared";
import mongoose, { Schema } from "mongoose";
import { ISetData } from "./SetData";

export interface IWorkoutData extends Document {
    userId: IUser["_id"];
    workout: IWorkout["_id"] | null;
    sets: ISetData["_id"][];
    createdAt: Date;
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
        sets: [
            {
                type: Schema.Types.ObjectId,
                ref: "SetData",
            },
        ],
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
);

export const WorkoutData = mongoose.model<IWorkoutData>(
    "WorkoutData",
    WorkoutDataSchema,
);
