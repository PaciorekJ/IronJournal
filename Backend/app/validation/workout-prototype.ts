import { SetSchema } from "@paciorekj/iron-journal-shared";
import {
    INTENSITY_LEVEL,
    IntensityLevelKey,
} from "@paciorekj/iron-journal-shared/constants";
import { z } from "zod";

export const createWorkoutPrototypeSchema = z
    .object({
        name: z.string().min(1, "Name is required."),
        description: z.string().optional(),
        sets: z.array(SetSchema).min(1, "At least one set is required."),
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
