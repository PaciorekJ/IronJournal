import mongoose, { Schema } from "mongoose";
import { SET_TYPE, SetTypeKey } from "../constants/set-type";
import {
    WEIGHT_SELECTION_METHOD,
    WeightSelectionMethodKey,
} from "../constants/weight-selection";
import { IExercise } from "./exercise";

type NumberOrRange = number | [number, number];

interface ITempo {
    eccentric: number;
    bottomPause: number;
    concentric: number;
    topPause: number;
}

interface IWeightSelection {
    method: WeightSelectionMethodKey;
    value: number;
}

interface IStraightSet {
    exercise: IExercise["_id"];
    reps: NumberOrRange;
    sets: NumberOrRange;
    tempo?: ITempo;
    weightSelection: IWeightSelection;
}

interface IDrop {
    loadReductionPercent: number;
    tempo?: ITempo;
    assisted?: boolean;
}

interface IDropSet {
    exercise: IExercise["_id"];
    initialWeightSelection: IWeightSelection;
    drops: IDrop[];
}

interface ISupersetExercise {
    exercise: IExercise["_id"];
    tempo?: ITempo;
    reps: NumberOrRange;
    restDurationInSeconds?: number;
    weightSelection: IWeightSelection;
}

interface ISuperset {
    exercises: ISupersetExercise[];
}

interface ISet {
    type: SetTypeKey;
    restDurationInSeconds?: number;

    straightSet?: IStraightSet;
    dropSet?: IDropSet;
    superSet?: ISuperset;
}

// NumberOrRange Schema
const NumberOrRangeSchema = new Schema<number | [number, number]>(
    {
        value: { type: Schema.Types.Mixed, required: true },
    },
    { _id: false },
);

NumberOrRangeSchema.pre("validate", function (next) {
    const value = this.value;
    if (typeof value === "number") return next();
    if (
        Array.isArray(value) &&
        value.length === 2 &&
        value[0] <= value[1] && // Validate ascending order
        value.every((v) => typeof v === "number")
    ) {
        return next();
    }
    return next(
        new Error(
            "Value must be a single number or an array of two numbers in ascending order.",
        ),
    );
});

// Tempo Schema
const TempoSchema = new Schema<ITempo>(
    {
        eccentric: { type: Number, min: 0, required: true },
        bottomPause: { type: Number, min: 0, required: true },
        concentric: { type: Number, min: 0, required: true },
        topPause: { type: Number, min: 0, required: true },
    },
    { _id: false },
);

// Weight Selection Schema
const WeightSelectionSchema = new Schema<IWeightSelection>(
    {
        method: {
            type: String,
            enum: Object.keys(WEIGHT_SELECTION_METHOD),
            required: true,
        },
        value: { type: Number, required: true },
    },
    { _id: false },
);

// Straight Set Schema
const StraightSetSchema = new Schema<IStraightSet>(
    {
        exercise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
            required: true,
        },
        reps: { type: NumberOrRangeSchema, required: true },
        sets: { type: NumberOrRangeSchema, required: true },
        tempo: { type: TempoSchema },
        weightSelection: { type: WeightSelectionSchema, required: true },
    },
    { _id: false },
);

// Drop Schema
const DropSchema = new Schema<IDrop>(
    {
        loadReductionPercent: {
            type: Number,
            min: 0,
            max: 100,
            required: true,
        },
        tempo: { type: TempoSchema },
        assisted: { type: Boolean, default: false },
    },
    { _id: false },
);

// Drop Set Schema
const DropSetSchema = new Schema<IDropSet>(
    {
        exercise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
            required: true,
        },
        initialWeightSelection: { type: WeightSelectionSchema, required: true },
        drops: { type: [DropSchema], required: true },
    },
    { _id: false },
);

// Superset Exercise Schema
const SupersetExerciseSchema = new Schema<ISupersetExercise>(
    {
        exercise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
            required: true,
        },
        reps: { type: NumberOrRangeSchema, required: true },
        tempo: { type: TempoSchema },
        weightSelection: { type: WeightSelectionSchema, required: true },
    },
    { _id: false },
);

// Superset Schema
const SupersetSchema = new Schema<ISuperset>(
    {
        exercises: { type: [SupersetExerciseSchema], required: true },
    },
    { _id: false },
);

// Main Set Schema
const SetSchema = new Schema<ISet>(
    {
        type: { type: String, enum: Object.keys(SET_TYPE), required: true },
        restDurationInSeconds: { type: Number, default: 0 },

        // Subfields for specific set types
        straightSet: { type: StraightSetSchema },
        dropSet: { type: DropSetSchema },
        superSet: { type: SupersetSchema },
    },
    { _id: false },
);

SetSchema.pre<ISet>("validate", function (next) {
    // Define allowed fields based on the set type
    const allowedFields = ["type", "restDurationInSeconds"];

    switch (this.type) {
        case "SET_PROTOTYPE_STRAIGHT_SET":
            if (!this.straightSet) {
                return next(
                    new Error(
                        "Straight Set is missing its 'straightSet' data.",
                    ),
                );
            }
            // Ensure only 'straightSet' is present
            allowedFields.push("straightSet");
            if (this.dropSet || this.superSet) {
                return next(
                    new Error(
                        "Straight Set should not have 'dropSet' or 'superSet' data.",
                    ),
                );
            }
            break;

        case "SET_PROTOTYPE_DROP_SET":
            if (
                !this.dropSet ||
                !this.dropSet.drops ||
                this.dropSet.drops.length === 0
            ) {
                return next(
                    new Error(
                        "Drop Set is missing drops. Ensure at least one drop is defined in 'dropSet.drops'.",
                    ),
                );
            }
            // Ensure only 'dropSet' is present
            allowedFields.push("dropSet");
            if (this.straightSet || this.superSet) {
                return next(
                    new Error(
                        "Drop Set should not have 'straightSet' or 'superSet' data.",
                    ),
                );
            }
            break;

        case "SET_PROTOTYPE_SUPER_SET":
            if (
                !this.superSet ||
                !this.superSet.exercises ||
                this.superSet.exercises.length === 0
            ) {
                return next(
                    new Error(
                        "Superset is missing exercises. Ensure at least one exercise is defined in 'superSet.exercises'.",
                    ),
                );
            }
            // Ensure only 'superSet' is present
            allowedFields.push("superSet");
            if (this.straightSet || this.dropSet) {
                return next(
                    new Error(
                        "Superset should not have 'straightSet' or 'dropSet' data.",
                    ),
                );
            }
            break;

        default:
            return next(
                new Error(
                    `Invalid set type: ${
                        this.type
                    }. Ensure 'type' is one of ${Object.keys(SET_TYPE).join(
                        ", ",
                    )}.`,
                ),
            );
    }

    // Check for unexpected fields
    const keys = Object.keys(this);
    const unexpectedFields = keys.filter((key) => !allowedFields.includes(key));
    if (unexpectedFields.length > 0) {
        return next(
            new Error(
                `Unexpected fields for set type '${
                    this.type
                }': ${unexpectedFields.join(", ")}.`,
            ),
        );
    }

    next();
});

export { SetSchema };
export type {
    IDrop,
    IDropSet,
    ISet,
    IStraightSet,
    ISuperset,
    ISupersetExercise,
    ITempo,
    IWeightSelection,
};

// TODO: Add Pyramid Sets, Rest-Pause Sets, and Circuit Sets, Isometric Sets, AMRAP Sets
