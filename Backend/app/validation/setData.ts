import {
    ObjectIdSchema,
    SET_TYPE,
    TempoSchema,
} from "@paciorekj/iron-journal-shared";
import { z } from "zod";
import {
    AmrapSetDataEntrySchema,
    AmrapSetDataSchema,
} from "./setDataTypes/amrapSetData";
import {
    CardioSetDataEntrySchema,
    CardioSetDataSchema,
} from "./setDataTypes/cardioSetData";
import {
    DropSetDataEntrySchema,
    DropSetDataSchema,
} from "./setDataTypes/dropSetData";
import {
    IsometricSetDataEntrySchema,
    IsometricSetDataSchema,
} from "./setDataTypes/isometricSetData";
import {
    PyramidSetDataEntrySchema,
    PyramidSetDataSchema,
} from "./setDataTypes/pyramidSetSchema";
import {
    RestPauseSetDataEntrySchema,
    RestPauseSetDataSchema,
} from "./setDataTypes/restPauseSetData";
import {
    StraightSetDataEntrySchema,
    StraightSetDataSchema,
} from "./setDataTypes/straightSetData";
import { SupersetDataSchema } from "./setDataTypes/SupersetData";
import { durationSchema, rpeSchema, weightUnitsSchema } from "./utils";

export const SET_DATA_VALIDATION_MAP: Record<string, z.ZodTypeAny> = {
    [SET_TYPE.STRAIGHT_SET]: StraightSetDataSchema,
    [SET_TYPE.DROP_SET]: DropSetDataSchema,
    [SET_TYPE.REST_PAUSE_SET]: RestPauseSetDataSchema,
    [SET_TYPE.PYRAMID_SET]: PyramidSetDataSchema,
    [SET_TYPE.REVERSE_PYRAMID_SET]: PyramidSetDataSchema, // Trust Client to enforce pyramid set structure
    [SET_TYPE.NON_LINEAR_PYRAMID_SET]: PyramidSetDataSchema,
    [SET_TYPE.ISOMETRIC_SET]: IsometricSetDataSchema,
    [SET_TYPE.AMRAP_SET]: AmrapSetDataSchema,
    [SET_TYPE.CARDIO_SET]: CardioSetDataSchema,
    [SET_TYPE.SUPER_SET]: SupersetDataSchema,
};

export const SetDataSchema = z
    .object({
        type: z.enum(Object.keys(SET_TYPE) as [string, ...string[]]),
        tempo: TempoSchema.optional(),
        weight: weightUnitsSchema.optional(),
        exercise: ObjectIdSchema.optional(),
        restDurationInSeconds: durationSchema.optional(),
        rpe: rpeSchema.optional(),
        setData: z
            .array(
                z.union([
                    StraightSetDataEntrySchema,
                    DropSetDataEntrySchema,
                    RestPauseSetDataEntrySchema,
                    PyramidSetDataEntrySchema,
                    IsometricSetDataEntrySchema,
                    AmrapSetDataEntrySchema,
                    CardioSetDataEntrySchema,
                ]),
            )
            .min(1),
    })
    .strict();

export const createSetDataSchema = SetDataSchema;
export const updateSetDataSchema = SetDataSchema.partial();

export type ISetDataCreateDTO = z.infer<typeof createSetDataSchema>;
export type ISetDataUpdateDTO = z.infer<typeof updateSetDataSchema>;
