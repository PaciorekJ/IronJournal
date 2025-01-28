import { z } from "zod";
import { WEIGHT_SELECTION_METHOD } from "../constants/weight-selection";

export const NumberOrRangeSchema = z.union([
    z.number(),
    z.tuple([z.number(), z.number()]).refine(([min, max]) => min <= max, {
        message: "Range must be in ascending order",
    }),
]);

export const TempoSchema = z.object({
    eccentric: z.number().min(0, "Eccentric tempo must be non-negative"),
    bottomPause: z.number().min(0, "Bottom pause must be non-negative"),
    concentric: z.number().min(0, "Concentric tempo must be non-negative"),
    topPause: z.number().min(0, "Top pause must be non-negative"),
});

export const WeightSelectionSchema = z.object({
    method: z.enum(
        Object.values(WEIGHT_SELECTION_METHOD) as [string, ...string[]],
    ),
    value: z.number(),
});

export const ObjectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, {
    message: "Invalid ObjectId format",
});

export type NumberOrRange = z.infer<typeof NumberOrRangeSchema>;
export type WeightSelection = z.infer<typeof WeightSelectionSchema>;
export type Tempo = z.infer<typeof TempoSchema>;
