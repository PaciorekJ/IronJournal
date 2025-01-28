import { ObjectIdSchema } from "@paciorekj/iron-journal-shared";
import { z } from "zod";
import { weightUnitsSchema } from "../utils";

export const StraightSetDataEntrySchema = z.object({
    reps: z.number().min(0, "Reps must be a non-negative number"),
    rpe: z
        .number()
        .min(1, "RPE must be between 1 and 10")
        .max(10, "RPE must be between 1 and 10")
        .optional(),
});

export const StraightSetDataSchema = z.object({
    exercise: ObjectIdSchema,
    weight: weightUnitsSchema,
    sets: z.array(StraightSetDataEntrySchema),
});
