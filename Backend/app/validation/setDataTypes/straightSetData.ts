import { ObjectIdSchema, SET_TYPE } from "@paciorekj/iron-journal-shared";
import { z } from "zod";
import { weightUnitsSchema } from "../utils";

export const StraightSetDataEntrySchema = z.object({
    reps: z.number().min(0, "Reps must be a non-negative number"),
});

export const StraightSetDataSchema = z.object({
    type: z.literal(SET_TYPE.STRAIGHT_SET),
    exercise: ObjectIdSchema,
    weight: weightUnitsSchema,
    setData: z.array(StraightSetDataEntrySchema),
});
