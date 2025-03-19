import { SetSchema } from "@paciorekj/iron-journal-shared";
import {
    INTENSITY_LEVEL,
    IntensityLevelKey,
    LANGUAGE,
    LanguageKey,
} from "@paciorekj/iron-journal-shared/constants";
import { z } from "zod";

export const createWorkoutPrototypeSchema = z
    .object({
        name: z.string().min(1, "Name is required."),
        description: z.string().optional(),
        isPublic: z.boolean().optional().default(false),
        originalLanguage: z.enum(
            Object.keys(LANGUAGE) as [LanguageKey, ...LanguageKey[]],
        ),
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
