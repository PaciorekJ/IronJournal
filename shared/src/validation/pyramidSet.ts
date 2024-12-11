import { z } from "zod";
import {
    NumberOrRangeSchema,
    ObjectIdSchema,
    WeightSelectionSchema,
} from "./utils";

export const PyramidSetEntrySchema = z.object({
    reps: NumberOrRangeSchema,
    weightSelection: WeightSelectionSchema.optional(),
});

export const PyramidSetSchema = z.object({
    exercise: ObjectIdSchema,
    sets: z.array(PyramidSetEntrySchema),
});

export type IPyramidSetEntry = z.infer<typeof PyramidSetEntrySchema>;
export type IPyramidSet = z.infer<typeof PyramidSetSchema>;
