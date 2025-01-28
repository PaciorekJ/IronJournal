import {
    DropSetEntrySchema,
    ObjectIdSchema,
    SET_TYPE,
} from "@paciorekj/iron-journal-shared";
import { z } from "zod";
import { weightUnitsSchema } from "../utils";

export const DropSetDataEntrySchema = z.object({
    reps: z.number().min(0, "Reps must be a non-negative number"),
    weight: weightUnitsSchema.optional(),
});

export const DropSetDataSchema = z.object({
    type: z.literal(SET_TYPE.DROP_SET),
    exercise: ObjectIdSchema,
    sets: z.array(DropSetEntrySchema),
});
