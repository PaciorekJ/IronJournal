import mongoose, { Schema } from 'mongoose';
import { INTENSITY_LEVEL } from '../constants/intensity-level.js';
import { validateLocalizedField, defaultLocalizedField } from '../localization/utils.js';
import { SetPrototypeSchema } from './set-prototype.js';
import { LANGUAGE } from '../constants/language.js';

const WorkoutPrototypeSchema = new Schema({
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
}, { timestamps: true });
WorkoutPrototypeSchema.index({ userId: 1 });
const WorkoutPrototype = mongoose.model("WorkoutPrototype", WorkoutPrototypeSchema);

export { WorkoutPrototype };
//# sourceMappingURL=workout-prototype.js.map
