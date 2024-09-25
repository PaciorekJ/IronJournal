// workoutPrototype.schema.ts

import { z } from "zod";
import {
    INTENSITY_LEVEL,
    IntensityLevelValue,
} from "~/constants/intensity-levels";
import { createSetPrototypeSchema } from "./set-prototype.server";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, "Invalid ObjectId");

export const createWorkoutPrototypeSchema = z
    .object({
        name: z.string().min(1, "Name is required."),
        programId: objectIdSchema.optional(),
        warmup: z.array(createSetPrototypeSchema).optional(),
        coolDown: z.array(createSetPrototypeSchema).optional(),
        sets: z
            .array(createSetPrototypeSchema)
            .min(1, "At least one set is required."),
        description: z.string().optional(),
        durationInMinutes: z.number().positive().optional(),
        intensityLevel: z
            .enum(
                Object.values(INTENSITY_LEVEL) as [
                    IntensityLevelValue,
                    ...IntensityLevelValue[],
                ],
            )
            .optional(),
        notes: z.string().optional(),
    })
    .strict();

export const updateWorkoutPrototypeSchema =
    createWorkoutPrototypeSchema.partial();

// TYPES for expected inputs to CRUD Operations
export type CreateWorkoutPrototypeInput = z.infer<
    typeof createWorkoutPrototypeSchema
>;
export type UpdateWorkoutPrototypeInput = z.infer<
    typeof updateWorkoutPrototypeSchema
>;
