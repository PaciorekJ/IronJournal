import mongoose, { Document, Schema } from "mongoose";
import { SET_TYPES, SetTypeValue } from "~/constants/set-types";
import {
    WEIGHT_SELECTION_METHOD,
    WeightSelectionMethodValue,
} from "~/constants/weight-selection";
import { IExercise } from "./exercise";

export type NumberOrRange = number | [number, number];

interface ISetPrototype extends Document {
    workoutId: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
    exercise: IExercise["_id"];
    alternatives?: IExercise["_id"][];
    restDurationInSeconds?: number;
    createdAt: Date;
    type: SetTypeValue;
}

const SetPrototypeSchema: Schema<ISetPrototype> = new Schema(
    {
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
        createdAt: { type: Date, default: Date.now },
        type: { type: String, enum: Object.values(SET_TYPES), required: true },
    },
    { discriminatorKey: "type" },
);

const SetPrototype = mongoose.model<ISetPrototype>(
    "SetPrototype",
    SetPrototypeSchema,
);

interface ISetPrototypeStraightSet extends ISetPrototype {
    reps: NumberOrRange;
    sets: NumberOrRange;
    weightSelection: {
        method: WeightSelectionMethodValue;
        value: number;
    };
}

const SetPrototypeStraightSetSchema = new Schema({
    reps: { type: Schema.Types.Mixed, required: true },
    sets: { type: Schema.Types.Mixed, required: true },
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
