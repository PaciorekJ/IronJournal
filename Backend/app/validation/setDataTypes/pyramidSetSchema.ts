import { ObjectIdSchema, SET_TYPE } from "@paciorekj/iron-journal-shared";
import { z } from "zod";
import { weightUnitsSchema } from "../utils";

export const PyramidSetDataEntrySchema = z.object({
    reps: z.number().min(0, "Reps must be a non-negative number"),
    weight: weightUnitsSchema,
});

export const PyramidSetDataSchema = z.object({
    type: z.enum([
        SET_TYPE.PYRAMID_SET,
        SET_TYPE.REVERSE_PYRAMID_SET,
        SET_TYPE.NON_LINEAR_PYRAMID_SET,
    ]),
    exercise: ObjectIdSchema,
    sets: z.array(PyramidSetDataEntrySchema),
});
