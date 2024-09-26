// setPrototype.ts

import mongoose, { Schema } from "mongoose";
import { SET_TYPES, SetTypeValue } from "~/constants/set-types";
import {
    WEIGHT_SELECTION_METHOD,
    WeightSelectionMethodValue,
} from "~/constants/weight-selection";
import { IExercise } from "./exercise";

export type NumberOrRange = number | [number, number];

export interface Tempo {
    eccentric: number;
    bottomPause: number;
    concentric: number;
    topPause: number;
}

interface ISetPrototype {
    type: SetTypeValue;
    exerciseId: IExercise["_id"];
    alternatives?: IExercise["_id"][];
    restDurationInSeconds?: number;

    // Fields specific to Straight Set
    reps?: NumberOrRange;
    sets?: NumberOrRange;
    tempo?: Tempo;
    weightSelection?: {
        method: WeightSelectionMethodValue;
        value: number;
    };

    // Fields specific to Drop Set
    drops?: {
        tempo?: Tempo;
        weightSelection: {
            method: WeightSelectionMethodValue;
            value: number;
        };
        reps: NumberOrRange;
    }[];

    // Fields specific to Superset
    exercises?: {
        tempo?: Tempo;
        exercise: IExercise["_id"];
        reps: NumberOrRange;
        restDurationInSeconds?: number;
        weightSelection: {
            method: WeightSelectionMethodValue;
            value: number;
        };
    }[];
}

const SetPrototypeSchema = new Schema<ISetPrototype>(
    {
        type: { type: String, enum: Object.values(SET_TYPES), required: true },
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
                enum: Object.values(WEIGHT_SELECTION_METHOD),
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
                        enum: Object.values(WEIGHT_SELECTION_METHOD),
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
                        enum: Object.values(WEIGHT_SELECTION_METHOD),
                    },
                    value: { type: Number },
                },
            },
        ],
    },
    { _id: false },
);

SetPrototypeSchema.pre<ISetPrototype>("validate", function (next) {
    switch (this.type) {
        case SET_TYPES.STRAIGHT_SET:
            if (!this.reps || !this.sets || !this.weightSelection) {
                return next(
                    new Error(
                        "Straight Set must have reps, sets, and weightSelection.",
                    ),
                );
            }
            break;
        case SET_TYPES.DROP_SET:
            if (
                !this.drops ||
                !Array.isArray(this.drops) ||
                this.drops.length === 0
            ) {
                return next(new Error("Drop Set must have at least one drop."));
            }
            break;
        case SET_TYPES.SUPER_SET:
            if (
                !this.exercises ||
                !Array.isArray(this.exercises) ||
                this.exercises.length === 0
            ) {
                return next(
                    new Error("Superset must have at least one exercise."),
                );
            }
            break;
        default:
            return next(new Error("Invalid set type."));
    }
    next();
});

export { SetPrototypeSchema };
export type { ISetPrototype };
