import { z } from "zod";
import { ObjectIdSchema, WeightSelectionSchema } from "./utils";

export const DropSetEntrySchema = z.object({
    loadReductionPercent: z.number().min(0).max(100),
    assisted: z.boolean().optional(),
});

export const DropSetSchema = z.object({
    exercise: ObjectIdSchema,
    initialWeightSelection: WeightSelectionSchema,
    drops: z.array(DropSetEntrySchema),
});

export type IDropSetEntry = z.infer<typeof DropSetEntrySchema>;
export type IDropSet = z.infer<typeof DropSetSchema>;
