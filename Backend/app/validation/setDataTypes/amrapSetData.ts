import { ObjectIdSchema, SET_TYPE } from "@paciorekj/iron-journal-shared";
import { z } from "zod";
import { durationSchema, repsSchema, weightUnitsSchema } from "../utils";

export const AmrapSetDataEntrySchema = z.object({
    durationInSeconds: durationSchema.optional(),
    reps: repsSchema,
});

export const AmrapSetDataSchema = z.object({
    type: z.literal(SET_TYPE.AMRAP_SET),
    exercise: ObjectIdSchema,
    weight: weightUnitsSchema,
    setData: z.array(AmrapSetDataEntrySchema),
});
