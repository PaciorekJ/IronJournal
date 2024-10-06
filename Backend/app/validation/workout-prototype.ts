// workoutPrototype.schema.ts

import { z } from "zod";
import {
    INTENSITY_LEVEL,
    IntensityLevelKey,
} from "~/constants/intensity-level";
import { createSetPrototypeSchema } from "./set-prototype.server";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, "Invalid ObjectId");

export const createWorkoutPrototypeSchema = z
    .object({
        name: z.string().min(1, "Name is required."),
        description: z.string().optional(),
        sets: z
            .array(createSetPrototypeSchema)
            .min(1, "At least one set is required."),
        userId: objectIdSchema,
        intensityLevel: z
            .enum(
                Object.keys(INTENSITY_LEVEL) as [
                    IntensityLevelKey,
                    ...IntensityLevelKey[],
                ],
            )
            .optional(),
    })
    .strict();

export const updateWorkoutPrototypeSchema =
    createWorkoutPrototypeSchema.partial();

export type IWorkoutPrototypeCreateDTO = z.infer<
    typeof createWorkoutPrototypeSchema
>;
export type IWorkoutPrototypeUpdateDTO = z.infer<
    typeof updateWorkoutPrototypeSchema
>;
