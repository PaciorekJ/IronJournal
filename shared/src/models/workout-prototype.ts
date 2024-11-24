import mongoose, { Document, Schema } from "mongoose";
import {
    INTENSITY_LEVEL,
    IntensityLevelKey,
} from "../constants/intensity-level";
import {
    defaultLocalizedField,
    localizedField,
    validateLocalizedField,
} from "../localization/utils";
import { ISetPrototype, SetPrototypeSchema } from "./set-prototype";
import { LanguageKey, LANGUAGE } from "../constants/language";

interface IWorkoutPrototype extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    name: localizedField<string>;
    originalLanguage: LanguageKey;
    description?: localizedField<string>;
    sets: ISetPrototype[];
    userId: mongoose.Schema.Types.ObjectId;
    intensityLevel?: IntensityLevelKey;
    createdAt: Date;
    updatedAt: Date;
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
        originalLanguage: {
            type: String,
            enum: Object.keys(LANGUAGE),
            required: true,
            default: "en",
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
