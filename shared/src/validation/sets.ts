import { z } from "zod";
import { SET_TYPE } from "../constants/set-type";
import { AmrapSetSchema } from "./amrapSet";
import { CardioSetSchema } from "./cardioSet";
import { DropSetSchema } from "./dropSet";
import { IsometricSetSchema } from "./isometricSet";
import { PyramidSetSchema } from "./pyramidSet";
import { RestPauseSetSchema } from "./restPauseSet";
import { StraightSetSchema } from "./straightSet";
import { SupersetSchema } from "./superSet";
import {
    NumberOrRangeSchema,
    TempoSchema,
    WeightSelectionSchema,
} from "./utils";

export const SET_VALIDATION_MAP: Record<string, z.ZodTypeAny> = {
    [SET_TYPE.STRAIGHT_SET]: StraightSetSchema,
    [SET_TYPE.DROP_SET]: DropSetSchema,
    [SET_TYPE.REST_PAUSE_SET]: RestPauseSetSchema,
    [SET_TYPE.PYRAMID_SET]: PyramidSetSchema,
    [SET_TYPE.ISOMETRIC_SET]: IsometricSetSchema,
    [SET_TYPE.AMRAP_SET]: AmrapSetSchema,
    [SET_TYPE.CARDIO_SET]: CardioSetSchema,
    [SET_TYPE.SUPER_SET]: SupersetSchema,
};

export const SetSchema = z.object({
    type: z.enum(Object.values(SET_TYPE) as [string, ...string[]]),
    restDurationInSeconds: NumberOrRangeSchema.optional(),
    initialWeightSelection: WeightSelectionSchema.optional(),
    tempo: TempoSchema.optional(),
    sets: z.array(
        z.union([
            StraightSetSchema,
            DropSetSchema,
            RestPauseSetSchema,
            PyramidSetSchema,
            IsometricSetSchema,
            AmrapSetSchema,
            CardioSetSchema,
            SupersetSchema,
        ]),
    ),
});

export type ISet = z.infer<typeof SetSchema>;
