import { ObjectIdSchema, SET_TYPE } from "@paciorekj/iron-journal-shared";
import { z } from "zod";
import { durationInSecondsSchema, weightUnitsSchema } from "../utils";

export const AmrapSetDataEntrySchema = z.object({
    durationInSeconds: durationInSecondsSchema.optional(),
    rpe: z
        .number()
        .min(1, "RPE must be between 1 and 10")
        .max(10, "RPE must be between 1 and 10")
        .optional(),
});

export const AmrapSetDataSchema = z.object({
    type: z.literal(SET_TYPE.AMRAP_SET),
    exercise: ObjectIdSchema,
    weight: weightUnitsSchema,
    sets: z.array(AmrapSetDataEntrySchema),
});
