import { ObjectIdSchema, SET_TYPE } from "@paciorekj/iron-journal-shared";
import { z } from "zod";
import { durationSchema, weightUnitsSchema } from "../utils";

export const IsometricSetDataEntrySchema = z.object({
    duration: durationSchema,
    weight: weightUnitsSchema.optional(),
});

export const IsometricSetDataSchema = z.object({
    type: z.literal(SET_TYPE.ISOMETRIC_SET),
    exercise: ObjectIdSchema,
    setData: z.array(IsometricSetDataEntrySchema),
});
