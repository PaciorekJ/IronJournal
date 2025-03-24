import {
    INTENSITY_LEVEL,
    IntensityLevelKey,
    LanguageKey,
    ObjectIdSchema,
} from "@paciorekj/iron-journal-shared";
import { z } from "node_modules/zod/lib/external";
import { IBuildQueryConfig, addPaginationAndSorting } from "./utils";

// Workout Prototype Query Configuration

export const workoutQueryConfig: IBuildQueryConfig = addPaginationAndSorting({
    name: {
        isArray: false,
        constructor: String,
        regex: (value: string) => new RegExp(value, "i"),
        schema: z.string().min(1),
        getFieldPath: (language: LanguageKey) => `name.${language}`,
    },
    intensityLevel: {
        isArray: false,
        constructor: String,
        schema: z.enum(
            Object.keys(INTENSITY_LEVEL) as [
                IntensityLevelKey,
                ...IntensityLevelKey[],
            ],
        ),
    },
    userId: {
        isArray: false,
        constructor: String,
        schema: ObjectIdSchema,
    },
});
