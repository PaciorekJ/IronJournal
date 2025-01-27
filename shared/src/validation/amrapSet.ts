import { z } from "zod";
import {
    NumberOrRangeSchema,
    ObjectIdSchema,
    WeightSelectionSchema,
} from "./utils";

export const AmrapSetEntrySchema = z.object({
    durationInSeconds: NumberOrRangeSchema.optional(),
    weightSelection: WeightSelectionSchema.optional(),
});

export const AmrapSetSchema = z.object({
    exercise: ObjectIdSchema,
    sets: z.array(AmrapSetEntrySchema),
});

export type IAmrapSetEntry = z.infer<typeof AmrapSetEntrySchema>;
export type IAmrapSet = z.infer<typeof AmrapSetSchema>;
