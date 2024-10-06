import mongoose, { Document, Schema } from "mongoose";
import {
    INTENSITY_LEVEL,
    IntensityLevelKey,
} from "~/constants/intensity-level";
import { Timestamps } from "~/interfaces/timestamp";
import {
    defaultLocalizedField,
    localizedField,
    validateLocalizedField,
} from "~/localization/utils.server";
import { ISetPrototype, SetPrototypeSchema } from "./set-prototype";

interface IWorkoutPrototype extends Document, Timestamps {
    _id: mongoose.Types.ObjectId;
    name: localizedField<string>;
    description?: localizedField<string>;
    sets: ISetPrototype[];
    userId: mongoose.Types.ObjectId;
    intensityLevel?: IntensityLevelKey;
}

const WorkoutPrototypeSchema: Schema<IWorkoutPrototype> = new Schema(
    {
        name: {
            type: Map,
            of: String,
            required: true,
            validate: {
                validator: validateLocalizedField,
                message: 'Invalid language key in "name" field.',
            },
        },
        description: {
            type: Map,
            of: String,
            default: defaultLocalizedField(),
            validate: {
                validator: validateLocalizedField,
                message: 'Invalid language key in "description" field.',
            },
        },
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
