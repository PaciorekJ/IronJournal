import mongoose, { Schema } from 'mongoose';
import { CATEGORY } from '../constants/category.js';
import { EQUIPMENT } from '../constants/equipment.js';
import { FORCE } from '../constants/force.js';
import { LEVEL } from '../constants/level.js';
import { MECHANIC } from '../constants/mechanic.js';
import { MUSCLE_GROUP } from '../constants/muscle-group.js';
import { validateLocalizedField, defaultLocalizedField } from '../localization/utils.js';

const ExerciseSchema = new Schema({
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
ExerciseSchema.pre("save", function (next) {
    this.images = this.images.map((image) => `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${image}`);
    next();
});
const Exercise = mongoose.model("Exercise", ExerciseSchema);

export { Exercise };
//# sourceMappingURL=exercise.js.map
