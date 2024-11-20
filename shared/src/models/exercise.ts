import mongoose, { Document, Schema } from "mongoose";
import { CATEGORY, CategoryKey } from "../constants/category";
import { EQUIPMENT, EquipmentKey } from "../constants/equipment";
import { FORCE, ForceKey } from "../constants/force";
import { LEVEL, LevelKey } from "../constants/level";
import { MECHANIC, MechanicKey } from "../constants/mechanic";
import { MUSCLE_GROUP, MuscleGroupKey } from "../constants/muscle-group";
import {
    defaultLocalizedField,
    localizedField,
    validateLocalizedField,
} from "../localization/utils";

interface IExercise extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    name: localizedField<string>;
    instructions: localizedField<string>[];
    level: LevelKey;
    force?: ForceKey;
    mechanic?: MechanicKey;
    equipment?: EquipmentKey;
    primaryMuscles: MuscleGroupKey[];
    secondaryMuscles?: MuscleGroupKey[];
    category: CategoryKey;
    images: string[];
    id: string;
}

const ExerciseSchema: Schema<IExercise> = new Schema({
    name: {
        type: Map,
        of: String,
        required: true,
        validate: {
            validator: validateLocalizedField,
            message: 'Invalid language key in "name" field.',
        },
    },
    instructions: {
        type: [
            {
                type: Map,
                of: String,
                required: true,
                default: defaultLocalizedField(),
                validate: {
                    validator: validateLocalizedField,
                    message: 'Invalid language key in "instructions" field.',
                },
            },
        ],
        required: true,
    },
    level: { type: String, enum: Object.keys(LEVEL), required: true },
    primaryMuscles: {
        type: [String],
        enum: Object.keys(MUSCLE_GROUP),
        required: true,
    },
    category: { type: String, enum: Object.keys(CATEGORY), required: true },
    images: { type: [String], required: true },
    id: { type: String, required: true, unique: true },
    force: { type: String, enum: Object.keys(FORCE) },
    mechanic: { type: String, enum: Object.keys(MECHANIC) },
    equipment: { type: String, enum: Object.keys(EQUIPMENT) },
    secondaryMuscles: {
        type: [String],
        enum: Object.keys(MUSCLE_GROUP),
        default: [],
    },
});

ExerciseSchema.pre<IExercise>("save", function (next) {
    this.images = this.images.map(
        (image) =>
            `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${image}`,
    );
    next();
});

const Exercise = mongoose.model<IExercise>("Exercise", ExerciseSchema);

export { Exercise };
export type { IExercise };
