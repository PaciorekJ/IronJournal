import { ObjectIdSchema, SET_TYPE } from "@paciorekj/iron-journal-shared";
import { z } from "zod";
import { distanceUnitsSchema, durationSchema } from "../utils";

export const CardioSetDataEntrySchema = z
    .object({
        distance: distanceUnitsSchema.optional(),
        duration: durationSchema.optional(),
    })
    .refine(
        (entry) => entry.distance || entry.duration,
        "Each CardioSetEntry must have either 'distance' or 'durationInSeconds'.",
    );

export const CardioSetDataSchema = z.object({
    type: z.literal(SET_TYPE.CARDIO_SET),
    exercise: ObjectIdSchema,
    setData: z.array(CardioSetDataEntrySchema),
});
