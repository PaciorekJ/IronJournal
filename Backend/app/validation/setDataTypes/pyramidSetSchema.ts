import { ObjectIdSchema, SET_TYPE } from "@paciorekj/iron-journal-shared";
import { z } from "zod";
import { repsSchema, weightUnitsSchema } from "../utils";

export const PyramidSetDataEntrySchema = z.object({
    reps: repsSchema,
    weight: weightUnitsSchema,
});

export const PyramidSetDataSchema = z.object({
    type: z.enum([
        SET_TYPE.PYRAMID_SET,
        SET_TYPE.REVERSE_PYRAMID_SET,
        SET_TYPE.NON_LINEAR_PYRAMID_SET,
    ]),
    exercise: ObjectIdSchema,
    setData: z.array(PyramidSetDataEntrySchema),
});
