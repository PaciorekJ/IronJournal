import { z } from "zod";
import {
    NumberOrRangeSchema,
    ObjectIdSchema,
    WeightSelectionSchema,
} from "./utils";

export const RestPauseSetEntrySchema = z.object({
    reps: NumberOrRangeSchema,
    restDurationInSeconds: NumberOrRangeSchema,
});

export const RestPauseSetSchema = z.object({
    exercise: ObjectIdSchema,
    weightSelection: WeightSelectionSchema.optional(),
    sets: z.array(RestPauseSetEntrySchema),
});

export type IRestPauseSet = z.infer<typeof RestPauseSetSchema>;
export type IRestPauseSetEntry = z.infer<typeof RestPauseSetEntrySchema>;
