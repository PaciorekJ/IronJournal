import { z } from "zod";
import {
    INTENSITY_LEVEL,
    IntensityLevelValue,
} from "~/constants/intensity-levels";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, "Invalid ObjectId");

export const createWorkoutPrototypeSchema = z
    .object({
        name: z.string(),
        programId: objectIdSchema.optional(),
        warmup: objectIdSchema.optional(),
        coolDown: objectIdSchema.optional(),
        sets: z.array(objectIdSchema),
        description: z.string().optional(),
        durationInMinutes: z.number().optional(),
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
export interface UpdateWorkoutPrototypeInput
    extends Partial<CreateWorkoutPrototypeInput> {}
