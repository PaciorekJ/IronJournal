import mongoose, { Document, Schema } from "mongoose";
import {
    INTENSITY_LEVEL,
    IntensityLevelValue,
} from "~/constants/intensity-levels";
import { Timestamps } from "~/interfaces/timestamp";

interface IWorkoutPrototype extends Document, Timestamps {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;

    warmup?: mongoose.Schema.Types.ObjectId;
    coolDown?: mongoose.Schema.Types.ObjectId;
    sets: mongoose.Schema.Types.ObjectId[];
    
    userId: mongoose.Schema.Types.ObjectId;
    
    description?: string;
    intensityLevel?: IntensityLevelValue;
    durationInMinutes?: number;
    notes?: string;
}

const WorkoutPrototypeSchema: Schema<IWorkoutPrototype> = new Schema(
    {
        name: { type: String, required: true },
        warmup: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SetPrototype",
                required: true,
            },
        ],
        sets: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SetPrototype",
                required: true,
            },
        ],
        coolDown: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SetPrototype",
                required: true,
            },
        ],
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

