import { ObjectIdSchema, SET_TYPE } from "@paciorekj/iron-journal-shared";
import { z } from "zod";
import { distanceUnitsSchema, durationInSecondsSchema } from "../utils";

export const CardioSetDataEntrySchema = z
    .object({
        distance: distanceUnitsSchema.optional(),
        durationInSeconds: durationInSecondsSchema.optional(),
    })
    .refine(
        (entry) => entry.distance || entry.durationInSeconds,
        "Each CardioSetEntry must have either 'distance' or 'durationInSeconds'.",
    );

export const CardioSetDataSchema = z.object({
    type: z.literal(SET_TYPE.CARDIO_SET),
    exercise: ObjectIdSchema,
    sets: z.array(CardioSetDataEntrySchema),
});
