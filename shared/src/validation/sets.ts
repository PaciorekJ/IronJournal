import { z } from "zod";
import { SET_TYPE } from "../constants/set-type";
import { AmrapSetEntrySchema, AmrapSetSchema } from "./amrapSet";
import { CardioSetEntrySchema, CardioSetSchema } from "./cardioSet";
import { DropSetEntrySchema, DropSetSchema } from "./dropSet";
import { IsometricSetEntrySchema, IsometricSetSchema } from "./isometricSet";
import { PyramidSetEntrySchema, PyramidSetSchema } from "./pyramidSet";
import { RestPauseSetEntrySchema, RestPauseSetSchema } from "./restPauseSet";
import { StraightSetEntrySchema, StraightSetSchema } from "./straightSet";
import { SupersetSchema } from "./superSet";
import {
    NumberOrRangeSchema,
    ObjectIdSchema,
    TempoSchema,
    WeightSelectionSchema,
} from "./utils";

export const SET_VALIDATION_MAP: Record<string, z.ZodTypeAny> = {
    [SET_TYPE.STRAIGHT_SET]: StraightSetSchema,
    [SET_TYPE.DROP_SET]: DropSetSchema,
    [SET_TYPE.REST_PAUSE_SET]: RestPauseSetSchema,
    [SET_TYPE.PYRAMID_SET]: PyramidSetSchema,
    [SET_TYPE.REVERSE_PYRAMID_SET]: PyramidSetSchema, // Trust Client to enforce pyramid set structure
    [SET_TYPE.NON_LINEAR_PYRAMID_SET]: PyramidSetSchema,
    [SET_TYPE.ISOMETRIC_SET]: IsometricSetSchema,
    [SET_TYPE.AMRAP_SET]: AmrapSetSchema,
    [SET_TYPE.CARDIO_SET]: CardioSetSchema,
    [SET_TYPE.SUPER_SET]: SupersetSchema,
};

export const SetSchema = z.object({
    type: z.enum(Object.values(SET_TYPE) as [string, ...string[]]),
    restDurationInSeconds: NumberOrRangeSchema.optional(),
    exercise: ObjectIdSchema.optional(),
    initialWeightSelection: WeightSelectionSchema.optional(),
    weightSelection: WeightSelectionSchema.optional(),
    tempo: TempoSchema.optional(),
    sets: z.array(
        z.union([
            StraightSetEntrySchema,
            DropSetEntrySchema,
            RestPauseSetEntrySchema,
            PyramidSetEntrySchema,
            IsometricSetEntrySchema,
            AmrapSetEntrySchema,
            CardioSetEntrySchema,
        ]),
    ),
});

export type ISet = z.infer<typeof SetSchema>;
