import mongoose, { Document, Schema } from "mongoose";
import {
    INTENSITY_LEVEL,
    IntensityLevelKey,
} from "~/constants/intensity-level";
import { Timestamps } from "~/interfaces/timestamp";
import { ISetPrototype, SetPrototypeSchema } from "./set-prototype";

interface IWorkoutPrototype extends Document, Timestamps {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    sets: ISetPrototype[];
    userId: mongoose.Types.ObjectId;
    intensityLevel?: IntensityLevelKey;
}

const WorkoutPrototypeSchema: Schema<IWorkoutPrototype> = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        sets: {
            type: [SetPrototypeSchema],
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        intensityLevel: { type: String, enum: Object.keys(INTENSITY_LEVEL) },
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
