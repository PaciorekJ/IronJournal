import { z } from "zod";
import {
    NumberOrRangeSchema,
    ObjectIdSchema,
    WeightSelectionSchema,
} from "./utils";

// Straight Set Entry Validator
export const StraightSetEntrySchema = z.object({});

// Straight Set Validator
export const StraightSetSchema = z.object({
    exercise: ObjectIdSchema,
    reps: NumberOrRangeSchema,
    weightSelection: WeightSelectionSchema.optional(),
    sets: z.array(StraightSetEntrySchema),
});

export type IStraightSet = z.infer<typeof StraightSetSchema>;
export type IStraightSetEntry = z.infer<typeof StraightSetEntrySchema>;
