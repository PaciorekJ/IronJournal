import mongoose, { Document, Schema } from "mongoose";
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

interface ISetPrototype extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    type: SetTypeValue;
    userId: mongoose.Schema.Types.ObjectId;
    exercise: IExercise["_id"];
    alternatives?: IExercise["_id"][];
    restDurationInSeconds?: number;
}

const SetPrototypeSchema: Schema<ISetPrototype> = new Schema(
    {
        type: { type: String, enum: Object.values(SET_TYPES), required: true },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        exercise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
            required: true,
        },
        alternatives: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Exercise",
                default: [],
            },
        ],
        restDurationInSeconds: { type: Number },
    },
    { discriminatorKey: "type", timestamps: true },
);

const SetPrototype = mongoose.model<ISetPrototype>(
    "SetPrototype",
    SetPrototypeSchema,
);

interface ISetPrototypeStraightSet extends ISetPrototype {
    reps: NumberOrRange;
    sets: NumberOrRange;
    tempo?: Tempo;
    weightSelection: {
        method: WeightSelectionMethodValue;
        value: number;
    };
}

const SetPrototypeStraightSetSchema = new Schema({
    reps: { type: Schema.Types.Mixed, required: true },
    sets: { type: Schema.Types.Mixed, required: true },
    tempo: { type: Schema.Types.Mixed },
    weightSelection: {
        method: {
            type: String,
            enum: Object.values(WEIGHT_SELECTION_METHOD),
            required: true,
        },
        value: { type: Number, required: true },
    },
});

const SetPrototypeStraightSet = mongoose.model<ISetPrototypeStraightSet>(
    SET_TYPES.STRAIGHT_SET,
    SetPrototypeStraightSetSchema,
);

interface ISetPrototypeDropSet extends ISetPrototype {
    drops: {
        tempo?: Tempo;
        weightSelection: {
            method: WeightSelectionMethodValue;
            value: number;
        };
        reps: NumberOrRange;
    }[];
}

const SetPrototypeDropSetSchema = new Schema({
    drops: [
        {
            tempo: { type: Schema.Types.Mixed },
            weightSelection: {
                method: {
                    type: String,
                    enum: Object.values(WEIGHT_SELECTION_METHOD),
                    required: true,
                },
                value: { type: Number, required: true },
            },
            reps: { type: Schema.Types.Mixed, required: true },
        },
    ],
});

const SetPrototypeDropSet = mongoose.model<ISetPrototypeDropSet>(
    SET_TYPES.DROP_SET,
    SetPrototypeDropSetSchema,
);

interface ISetPrototypeSuperset extends ISetPrototype {
    exercises: {
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

const SetPrototypeSupersetSchema = new Schema({
    exercises: [
        {
            tempo: { type: Schema.Types.Mixed },
            exercise: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Exercise",
                required: true,
            },
            reps: { type: Schema.Types.Mixed, required: true },
            restDurationInSeconds: { type: Number },
            weightSelection: {
                method: {
                    type: String,
                    enum: Object.values(WEIGHT_SELECTION_METHOD),
                    required: true,
                },
                value: { type: Number, required: true },
            },
        },
    ],
});

const SetPrototypeSuperset = mongoose.model<ISetPrototypeSuperset>(
    SET_TYPES.SUPER_SET,
    SetPrototypeSupersetSchema,
);

export {
    SetPrototype,
    SetPrototypeDropSet,
    SetPrototypeStraightSet,
    SetPrototypeSuperset,
};
export type {
    ISetPrototype,
    ISetPrototypeDropSet,
    ISetPrototypeStraightSet,
    ISetPrototypeSuperset,
};
