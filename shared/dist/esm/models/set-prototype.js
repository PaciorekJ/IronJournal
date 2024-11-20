import mongoose, { Schema } from 'mongoose';
import { SET_TYPE } from '../constants/set-type.js';
import { WEIGHT_SELECTION_METHOD } from '../constants/weight-selection.js';

const SetPrototypeSchema = new Schema({
    type: { type: String, enum: Object.keys(SET_TYPE), required: true },
    exerciseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exercise",
    },
    alternatives: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
            default: [],
        },
    ],
    restDurationInSeconds: { type: Number },
    // Fields specific to Straight Set
    reps: { type: Schema.Types.Mixed },
    sets: { type: Schema.Types.Mixed },
    tempo: {
        eccentric: { type: Number },
        bottomPause: { type: Number },
        concentric: { type: Number },
        topPause: { type: Number },
    },
    weightSelection: {
        method: {
            type: String,
            enum: Object.keys(WEIGHT_SELECTION_METHOD),
        },
        value: { type: Number },
    },
    // Fields specific to Drop Set
    drops: [
        {
            tempo: {
                eccentric: { type: Number },
                bottomPause: { type: Number },
                concentric: { type: Number },
                topPause: { type: Number },
            },
            weightSelection: {
                method: {
                    type: String,
                    enum: Object.keys(WEIGHT_SELECTION_METHOD),
                },
                value: { type: Number },
            },
            reps: { type: Schema.Types.Mixed },
        },
    ],
    // Fields specific to Superset
    exercises: [
        {
            tempo: {
                eccentric: { type: Number },
                bottomPause: { type: Number },
                concentric: { type: Number },
                topPause: { type: Number },
            },
            exercise: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Exercise",
            },
            reps: { type: Schema.Types.Mixed },
            restDurationInSeconds: { type: Number },
            weightSelection: {
                method: {
                    type: String,
                    enum: Object.keys(WEIGHT_SELECTION_METHOD),
                },
                value: { type: Number },
            },
        },
    ],
}, { _id: false });
SetPrototypeSchema.pre("validate", function (next) {
    switch (SET_TYPE[this.type]) {
        case SET_TYPE.SET_PROTOTYPE_STRAIGHT_SET:
            if (!this.reps || !this.sets || !this.weightSelection) {
                return next(new Error("Straight Set must have reps, sets, and weightSelection."));
            }
            break;
        case SET_TYPE.SET_PROTOTYPE_DROP_SET:
            if (!this.drops ||
                !Array.isArray(this.drops) ||
                this.drops.length === 0) {
                return next(new Error("Drop Set must have at least one drop."));
            }
            break;
        case SET_TYPE.SET_PROTOTYPE_SUPER_SET:
            if (!this.exercises ||
                !Array.isArray(this.exercises) ||
                this.exercises.length === 0) {
                return next(new Error("Superset must have at least one exercise."));
            }
            break;
        default:
            return next(new Error("Invalid set type."));
    }
    next();
});

export { SetPrototypeSchema };
//# sourceMappingURL=set-prototype.js.map
