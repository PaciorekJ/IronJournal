import { z } from "zod";
import { NumberOrRangeSchema, ObjectIdSchema } from "./utils";

export const CardioSetEntrySchema = z
    .object({
        distanceInCentimeters: NumberOrRangeSchema.optional(), // TODO: This needs to be converted to the user preferred units
        durationInSeconds: NumberOrRangeSchema.optional(),
    })
    .refine((entry) => entry.distanceInCentimeters || entry.durationInSeconds, {
        message:
            "Each CardioSetEntry must have either 'distance' or 'durationInSeconds'.",
    });

// Cardio Set Validator
export const CardioSetSchema = z.object({
    exercise: ObjectIdSchema,
    sets: z.array(CardioSetEntrySchema),
});

export type ICardioSetEntry = z.infer<typeof CardioSetEntrySchema>;
export type ICardioSet = z.infer<typeof CardioSetSchema>;
