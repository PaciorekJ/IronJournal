import mongoose, { Schema } from "mongoose";
import { SET_TYPE, SetTypeKey } from "../constants/set-type";
import {
    WEIGHT_SELECTION_METHOD,
    WeightSelectionMethodKey,
} from "../constants/weight-selection";
import { IExercise } from "./exercise";

// NumberOrRange type
export type NumberOrRange = number | [number, number];

// Interfaces

// Tempo interface
interface ITempo {
    eccentric: number;
    bottomPause: number;
    concentric: number;
    topPause: number;
}

// WeightSelection interface
interface IWeightSelection {
    method: WeightSelectionMethodKey;
    value: number;
}

// Straight Set Entry interface
interface IStraightSetEntry {
    reps: NumberOrRange;
    weightSelection?: IWeightSelection;
}

// Straight Set interface
interface IStraightSet {
    exercise: IExercise["_id"];
    sets: IStraightSetEntry[];
}

// Drop Set Entry interface
interface IDropSetEntry {
    loadReductionPercent: number;
    assisted?: boolean;
}

// Drop Set interface
interface IDropSet {
    exercise: IExercise["_id"];
    initialWeightSelection: IWeightSelection;
    sets: IDropSetEntry[];
}

// Rest-Pause Set Entry interface
interface IRestPauseSetEntry {
    reps: NumberOrRange;
    restDurationInSeconds: NumberOrRange;
}

// Rest-Pause Set interface
interface IRestPauseSet {
    exercise: IExercise["_id"];
    weightSelection?: IWeightSelection;
    sets: IRestPauseSetEntry[];
}

// Pyramid Set Entry interface
interface IPyramidSetEntry {
    reps: NumberOrRange;
    weightSelection?: IWeightSelection;
}

// Pyramid Set interface
interface IPyramidSet {
    exercise: IExercise["_id"];
    sets: IPyramidSetEntry[];
}

// Isometric Set Entry interface
interface IIsometricSetEntry {
    durationInSeconds: NumberOrRange;
    weightSelection?: IWeightSelection;
}

// Isometric Set interface
interface IIsometricSet {
    exercise: IExercise["_id"];
    sets: IIsometricSetEntry[];
}

// AMRAP Set Entry interface
interface IAmrapSetEntry {
    timeFrameInSeconds?: NumberOrRange;
    weightSelection?: IWeightSelection;
}

// AMRAP Set interface
interface IAmrapSet {
    exercise: IExercise["_id"];
    sets: IAmrapSetEntry[];
}

// Superset interface
interface ISuperset {
    sets: ISet[];
}

interface ICardioSetEntry {
    distance?: NumberOrRange;
    durationInSeconds?: NumberOrRange;
    restDuration?: NumberOrRange;
    weight?: number; // Weight in kilograms
}

interface ICardioSet {
    exercise: IExercise["_id"];
    sets: ICardioSetEntry[];
}

// Main Set interface
interface ISet { // Each one of these are single sets
    type: SetTypeKey;
    restDurationInSeconds?: NumberOrRange; // Rest time for after the set
    tempo?: ITempo;

    straightSet?: IStraightSet;
    dropSet?: IDropSet;
    restPauseSet?: IRestPauseSet;
    pyramidSet?: IPyramidSet;
    isometricSet?: IIsometricSet;
    amrapSet?: IAmrapSet;
    cardioSet?: ICardioSet;
    superSet?: ISuperset;
}

// Schemas

// NumberOrRange Schema
const NumberOrRangeSchema = new Schema(
    { value: { type: Schema.Types.Mixed, required: true } },
    { _id: false },
);

NumberOrRangeSchema.pre("validate", function (next) {
    const value = this.value;
    if (typeof value === "number") return next();
    if (
        Array.isArray(value) &&
        value.length === 2 &&
        value[0] <= value[1] &&
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

// Cardio Set Entry Schema
const CardioSetEntrySchema = new Schema<ICardioSetEntry>(
    {
        distance: { type: Schema.Types.Mixed }, // NumberOrRange
        durationInSeconds: { type: Schema.Types.Mixed }, // NumberOrRange
        restDuration: { type: Schema.Types.Mixed }, // NumberOrRange
        weight: { type: Number }, // Normalized to KG
    },
    { _id: false },
);

// Validate 'distance' and 'durationInSeconds' to be NumberOrRange
CardioSetEntrySchema.path("distance", NumberOrRangeSchema);
CardioSetEntrySchema.path("durationInSeconds", NumberOrRangeSchema);
CardioSetEntrySchema.path("restDuration", NumberOrRangeSchema);

// Cardio Set Schema
const CardioSetSchema = new Schema<ICardioSet>(
    {
        exercise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
            required: true,
        },
        sets: { type: [CardioSetEntrySchema], required: true },
    },
    { _id: false },
);

// Ensure that either 'distance' or 'durationInSeconds' is provided in each CardioSetEntry
CardioSetSchema.pre("validate", function (next) {
    const setsArray = this.sets as unknown as ICardioSetEntry[];

    for (const set of setsArray) {
        if (!set.distance && !set.durationInSeconds) {
            return next(
                new Error(
                    "Each CardioSetEntry must have either 'distance' or 'durationInSeconds' defined.",
                ),
            );
        }
    }

    next();
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

// Straight Set Entry Schema
const StraightSetEntrySchema = new Schema<IStraightSetEntry>(
    {
        reps: { type: Schema.Types.Mixed, required: true },
        weightSelection: { type: WeightSelectionSchema },
    },
    { _id: false },
);

// Set the path for 'reps' to use NumberOrRangeSchema
StraightSetEntrySchema.path("reps", NumberOrRangeSchema);

// Straight Set Schema
const StraightSetSchema = new Schema<IStraightSet>(
    {
        exercise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
            required: true,
        },
        sets: { type: [StraightSetEntrySchema], required: true },
    },
    { _id: false },
);

// Drop Set Entry Schema
const DropSetEntrySchema = new Schema<IDropSetEntry>(
    {
        loadReductionPercent: {
            type: Number,
            min: 0,
            max: 100,
            required: true,
        },
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
        sets: { type: [DropSetEntrySchema], required: true },
    },
    { _id: false },
);

// Rest-Pause Set Entry Schema
const RestPauseSetEntrySchema = new Schema<IRestPauseSetEntry>(
    {
        reps: { type: Schema.Types.Mixed, required: true },
        restDurationInSeconds: { type: Schema.Types.Mixed, required: true },
    },
    { _id: false },
);

// Set the paths for 'reps' and 'restDurationInSeconds' to use NumberOrRangeSchema
RestPauseSetEntrySchema.path("reps", NumberOrRangeSchema);
RestPauseSetEntrySchema.path("restDurationInSeconds", NumberOrRangeSchema);

// Rest-Pause Set Schema
const RestPauseSetSchema = new Schema<IRestPauseSet>(
    {
        exercise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
            required: true,
        },
        sets: { type: [RestPauseSetEntrySchema], required: true },
        weightSelection: { type: WeightSelectionSchema },
    },
    { _id: false },
);

// Pyramid Set Entry Schema
const PyramidSetEntrySchema = new Schema<IPyramidSetEntry>(
    {
        reps: { type: Schema.Types.Mixed, required: true },
        weightSelection: { type: WeightSelectionSchema },
    },
    { _id: false },
);

// Set the path for 'reps' to use NumberOrRangeSchema
PyramidSetEntrySchema.path("reps", NumberOrRangeSchema);

// Pyramid Set Schema
const PyramidSetSchema = new Schema<IPyramidSet>(
    {
        exercise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
            required: true,
        },
        sets: { type: [PyramidSetEntrySchema], required: true },
    },
    { _id: false },
);

// Isometric Set Entry Schema
const IsometricSetEntrySchema = new Schema<IIsometricSetEntry>(
    {
        durationInSeconds: { type: Schema.Types.Mixed, required: true },
        weightSelection: { type: WeightSelectionSchema },
    },
    { _id: false },
);

// Set the path for 'durationInSeconds' to use NumberOrRangeSchema
IsometricSetEntrySchema.path("durationInSeconds", NumberOrRangeSchema);

// Isometric Set Schema
const IsometricSetSchema = new Schema<IIsometricSet>(
    {
        exercise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
            required: true,
        },
        sets: { type: [IsometricSetEntrySchema], required: true },
    },
    { _id: false },
);

// AMRAP Set Entry Schema
const AmrapSetEntrySchema = new Schema<IAmrapSetEntry>(
    {
        timeFrameInSeconds: { type: Schema.Types.Mixed },
        weightSelection: { type: WeightSelectionSchema },
    },
    { _id: false },
);

// Set the path for 'timeFrameInSeconds' to use NumberOrRangeSchema
AmrapSetEntrySchema.path("timeFrameInSeconds", NumberOrRangeSchema);

// AMRAP Set Schema
const AmrapSetSchema = new Schema<IAmrapSet>(
    {
        exercise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
            required: true,
        },
        sets: { type: [AmrapSetEntrySchema], required: true },
    },
    { _id: false },
);

// Superset Schema
const SupersetSchema = new Schema<ISuperset>(
    {
        sets: {
            type: [
                /* placeholder for SetSchema */
            ],
            required: true,
        },
    },
    { _id: false },
);

// Note: Removed 'rounds' field as it's not present in the ISuperset interface

// Main Set Schema
const SetSchemaFields = {
    type: { type: String, enum: Object.values(SET_TYPE), required: true },
    tempo: { type: TempoSchema },
    restDurationInSeconds: { type: Schema.Types.Mixed, min: 0 },
    straightSet: { type: StraightSetSchema },
    dropSet: { type: DropSetSchema },
    restPauseSet: { type: RestPauseSetSchema },
    pyramidSet: { type: PyramidSetSchema },
    isometricSet: { type: IsometricSetSchema },
    amrapSet: { type: AmrapSetSchema },
    cardioSet: { type: CardioSetSchema },
    // 'superSet' will be added later
};

const SetSchema = new Schema<ISet>(SetSchemaFields, { _id: false });
StraightSetEntrySchema.path("restDurationInSeconds", NumberOrRangeSchema);

// Resolve circular references
SupersetSchema.path("sets", [SetSchema]);
SetSchema.add({ superSet: { type: SupersetSchema } });

// Validation Logic
SetSchema.pre<ISet>("validate", function (next) {
    const allowedFields = ["type", "tempo"];
    const setType = this.type;

    switch (setType) {
        case SET_TYPE.STRAIGHT_SET:
            if (
                !this.straightSet ||
                !this.straightSet.sets ||
                this.straightSet.sets.length === 0
            ) {
                return next(
                    new Error(
                        "Straight Set is missing its 'straightSet.sets' data.",
                    ),
                );
            }
            allowedFields.push("straightSet");
            break;

        case SET_TYPE.DROP_SET:
            if (
                !this.dropSet ||
                !this.dropSet.sets ||
                this.dropSet.sets.length === 0
            ) {
                return next(
                    new Error("Drop Set is missing its 'dropSet.sets' data."),
                );
            }
            allowedFields.push("dropSet");
            break;

        case SET_TYPE.SUPER_SET:
            if (
                !this.superSet ||
                !this.superSet.sets ||
                this.superSet.sets.length === 0
            ) {
                return next(
                    new Error("Superset is missing its 'superSet.sets' data."),
                );
            }
            allowedFields.push("superSet");
            break;

        case SET_TYPE.REST_PAUSE_SET:
            if (
                !this.restPauseSet ||
                !this.restPauseSet.sets ||
                this.restPauseSet.sets.length === 0
            ) {
                return next(
                    new Error(
                        "Rest-Pause Set is missing its 'restPauseSet.sets' data.",
                    ),
                );
            }
            allowedFields.push("restPauseSet");
            break;

        case SET_TYPE.PYRAMID_SET:
        case SET_TYPE.REVERSE_PYRAMID_SET:
        case SET_TYPE.NON_LINEAR_PYRAMID_SET:
            if (
                !this.pyramidSet ||
                !this.pyramidSet.sets ||
                this.pyramidSet.sets.length === 0
            ) {
                return next(
                    new Error(
                        "Pyramid Set is missing its 'pyramidSet.sets' data.",
                    ),
                );
            }
            allowedFields.push("pyramidSet");
            break;

        case SET_TYPE.ISOMETRIC_SET:
            if (
                !this.isometricSet ||
                !this.isometricSet.sets ||
                this.isometricSet.sets.length === 0
            ) {
                return next(
                    new Error(
                        "Isometric Set is missing its 'isometricSet.sets' data.",
                    ),
                );
            }
            allowedFields.push("isometricSet");
            break;

        case SET_TYPE.AMRAP_SET:
            if (
                !this.amrapSet ||
                !this.amrapSet.sets ||
                this.amrapSet.sets.length === 0
            ) {
                return next(
                    new Error("AMRAP Set is missing its 'amrapSet.sets' data."),
                );
            }
            allowedFields.push("amrapSet");
            break;

        default:
            return next(
                new Error(
                    `Invalid set type: ${
                        this.type
                    }. Ensure 'type' is one of ${Object.values(SET_TYPE).join(
                        ", ",
                    )}.`,
                ),
            );
    }

    // Ensure only allowed fields are present
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

// Export statements
export { SetSchema };
export type {
    IAmrapSet,
    IAmrapSetEntry,
    ICardioSet,
    ICardioSetEntry,
    IDropSet,
    IDropSetEntry,
    IIsometricSet,
    IIsometricSetEntry,
    IPyramidSet,
    IPyramidSetEntry,
    IRestPauseSet,
    IRestPauseSetEntry,
    ISet,
    IStraightSet,
    IStraightSetEntry,
    ISuperset,
    ITempo,
    IWeightSelection,
};
