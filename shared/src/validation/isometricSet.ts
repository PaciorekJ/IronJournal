import { z } from "zod";
import { NumberOrRangeSchema, WeightSelectionSchema } from "./utils";

export const IsometricSetEntrySchema = z.object({
    durationInSeconds: NumberOrRangeSchema,
    weightSelection: WeightSelectionSchema.optional(),
});

export const IsometricSetSchema = z.object({
    exercise: z.string(),
    sets: z.array(IsometricSetEntrySchema),
});

export type IIsometricSetEntry = z.infer<typeof IsometricSetEntrySchema>;
export type IIsometricSet = z.infer<typeof IsometricSetSchema>;
