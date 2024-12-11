import mongoose, { Document, Schema } from "mongoose";
import {
    INTENSITY_LEVEL,
    IntensityLevelKey,
} from "../constants/intensity-level";
import { LANGUAGE, LanguageKey } from "../constants/language";
import {
    defaultLocalizedField,
    localizedField,
    validateLocalizedField,
} from "../localization/utils";
import { ISet } from "../validation";
import SetSchema from "./set";

interface IWorkout extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    name: localizedField<string>;
    originalLanguage: LanguageKey;
    description?: localizedField<string>;
    sets: ISet[];
    userId: mongoose.Schema.Types.ObjectId;
    intensityLevel?: IntensityLevelKey;
    createdAt: Date;
    updatedAt: Date;
}

const WorkoutSchema: Schema<IWorkout> = new Schema(
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
            default: defaultLocalizedField(""),
            validate: {
                validator: validateLocalizedField,
                message: 'Invalid language key in "description" field.',
            },
        },
        originalLanguage: {
            type: String,
            enum: Object.keys(LANGUAGE),
            required: true,
        },
        sets: {
            type: [SetSchema],
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

WorkoutSchema.index({ userId: 1 });

const Workout = mongoose.model<IWorkout>("WorkoutPrototype", WorkoutSchema);

export { Workout };
export type { IWorkout };
