import mongoose, { Document, Schema } from "mongoose";
import { CATEGORY, CategoryValue } from "~/constants/category";
import { EQUIPMENT, EquipmentValue } from "~/constants/equipment";
import { FORCE, ForceValue } from "~/constants/force";
import { LEVEL, LevelValue } from "~/constants/level";
import { MECHANIC, MechanicValue } from "~/constants/mechanic";
import { MUSCLE_GROUPS, MuscleGroupValue } from "~/constants/muscle-groups";

interface IExercise extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    level: LevelValue;
    force?: ForceValue;
    mechanic?: MechanicValue;
    equipment?: EquipmentValue;
    primaryMuscles: MuscleGroupValue[];
    secondaryMuscles?: MuscleGroupValue[];
    instructions: string[];
    category: CategoryValue;
    images: string[];
    id: string;
}

const ExerciseSchema: Schema<IExercise> = new Schema({
    name: { type: String, required: true },
    level: { type: String, enum: Object.values(LEVEL), required: true },
    primaryMuscles: {
        type: [String],
        enum: Object.values(MUSCLE_GROUPS),
        required: true,
    },
    instructions: { type: [String], required: true },
    category: { type: String, enum: Object.values(CATEGORY), required: true },
    images: { type: [String], required: true },
    id: { type: String, required: true, unique: true },
    force: { type: String, enum: Object.values(FORCE) },
    mechanic: { type: String, enum: Object.values(MECHANIC) },
    equipment: { type: String, enum: Object.values(EQUIPMENT) },
    secondaryMuscles: {
        type: [String],
        enum: Object.values(MUSCLE_GROUPS),
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

ExerciseSchema.pre("save", function (next) {
   // Convert all all relevant fields to proper language mappings 

   // Call libra API for each language, and store each according to the language
});

const Exercise = mongoose.model<IExercise>("Exercise", ExerciseSchema);

export { Exercise };
export type { IExercise };
