// workoutPrototype.ts

import mongoose, { Document, Schema } from "mongoose";
import {
    INTENSITY_LEVEL,
    IntensityLevelValue,
} from "~/constants/intensity-levels";
import { Timestamps } from "~/interfaces/timestamp";
import { ISetPrototype, SetPrototypeSchema } from "./set-prototype";

interface IWorkoutPrototype extends Document, Timestamps {
    _id: mongoose.Types.ObjectId;
    name: string;
    warmup?: ISetPrototype[]; // Embedded SetPrototypes
    sets: ISetPrototype[]; // Embedded SetPrototypes
    coolDown?: ISetPrototype[]; // Embedded SetPrototypes
    userId: mongoose.Types.ObjectId;
    description?: string;
    intensityLevel?: IntensityLevelValue;
    durationInMinutes?: number;
    notes?: string;
}

const WorkoutPrototypeSchema: Schema<IWorkoutPrototype> = new Schema(
    {
        name: { type: String, required: true },
        warmup: {
            type: [SetPrototypeSchema],
            default: [],
        },
        sets: {
            type: [SetPrototypeSchema],
            required: true,
        },
        coolDown: {
            type: [SetPrototypeSchema],
            default: [],
        },
        description: { type: String },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        durationInMinutes: { type: Number },
        intensityLevel: { type: String, enum: Object.values(INTENSITY_LEVEL) },
        notes: { type: String },
    },
    { timestamps: true },
);

WorkoutPrototypeSchema.index({ userId: 1 });

const WorkoutPrototype = mongoose.model<IWorkoutPrototype>(
    "WorkoutPrototype",
    WorkoutPrototypeSchema,
);

export { WorkoutPrototype };
export type { IWorkoutPrototype };
