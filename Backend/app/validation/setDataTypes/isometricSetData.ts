import { ObjectIdSchema, SET_TYPE } from "@paciorekj/iron-journal-shared";
import { z } from "zod";
import { durationInSecondsSchema, weightUnitsSchema } from "../utils";

export const IsometricSetDataEntrySchema = z.object({
    durationInSeconds: durationInSecondsSchema,
    weight: weightUnitsSchema.optional(),
});

export const IsometricSetDataSchema = z.object({
    type: z.literal(SET_TYPE.ISOMETRIC_SET),
    exercise: ObjectIdSchema,
    sets: z.array(IsometricSetDataEntrySchema),
});
