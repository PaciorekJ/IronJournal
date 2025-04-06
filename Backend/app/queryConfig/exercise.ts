import {
    CATEGORY,
    CategoryKey,
    EQUIPMENT,
    EquipmentKey,
    FORCE,
    ForceKey,
    LanguageKey,
    LEVEL,
    LevelKey,
    MUSCLE_GROUP,
    MuscleGroupKey,
} from "@paciorekj/iron-journal-shared";
import { z } from "zod";
import { addPaginationAndSorting, IBuildQueryConfig } from "./utils";

// Exercise Query Configuration

export const exerciseQueryConfig: IBuildQueryConfig = addPaginationAndSorting({
    name: {
        isArray: false,
        constructor: String,
        regex: (value: string) => new RegExp(value, "i"),
        schema: z.string().min(1),
        getFieldPath: (language: LanguageKey) => `name.${language}`,
    },
    level: {
        isArray: false,
        constructor: String,
        schema: z.enum(Object.keys(LEVEL) as [LevelKey, ...LevelKey[]]),
    },
    category: {
        isArray: false,
        constructor: String,
        schema: z.enum(
            Object.keys(CATEGORY) as [CategoryKey, ...CategoryKey[]],
        ),
    },
    force: {
        isArray: false,
        constructor: String,
        schema: z.enum(Object.keys(FORCE) as [ForceKey, ...ForceKey[]]),
    },
    equipment: {
        isArray: true,
        constructor: String,
        schema: z.enum(
            Object.keys(EQUIPMENT) as [EquipmentKey, ...EquipmentKey[]],
        ),
    },
    primaryMuscles: {
        isArray: true,
        constructor: String,
        schema: z.enum(
            Object.keys(MUSCLE_GROUP) as [MuscleGroupKey, ...MuscleGroupKey[]],
        ),
    },
    secondaryMuscles: {
        isArray: true,
        constructor: String,
        schema: z.enum(
            Object.keys(MUSCLE_GROUP) as [MuscleGroupKey, ...MuscleGroupKey[]],
        ),
    },
});
