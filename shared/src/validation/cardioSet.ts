import { z } from "zod";
import { NumberOrRangeSchema, ObjectIdSchema } from "./utils";

export const CardioSetEntrySchema = z
    .object({
        distance: NumberOrRangeSchema.optional(),
        durationInSeconds: NumberOrRangeSchema.optional(),
        restDuration: NumberOrRangeSchema.optional(),
    })
    .refine((entry) => entry.distance || entry.durationInSeconds, {
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
