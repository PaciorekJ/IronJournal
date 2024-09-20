import { z } from "zod";
import { CATEGORY, CategoryValue } from "~/constants/category";
import { EQUIPMENT, EquipmentValue } from "~/constants/equipment";
import { FORCE, ForceValue } from "~/constants/force";
import { LEVEL, LevelValue } from "~/constants/level";
import { MECHANIC, MechanicValue } from "~/constants/mechanic";
import { MUSCLE_GROUPS, MuscleGroupValue } from "~/constants/muscle-groups";

// Creation Schema for Exercise
export const createExerciseSchema = z
    .object({
        name: z.string(),
        level: z.enum(Object.values(LEVEL) as [LevelValue, ...LevelValue[]]),
        primaryMuscles: z.array(
            z.enum(
                Object.values(MUSCLE_GROUPS) as [
                    MuscleGroupValue,
                    ...MuscleGroupValue[],
                ],
            ),
        ),
        instructions: z.array(z.string()),
        category: z.enum(
            Object.values(CATEGORY) as [CategoryValue, ...CategoryValue[]],
        ),
        images: z.array(z.string()),
        id: z.string(), // Unique identifier
        force: z
            .enum(Object.values(FORCE) as [ForceValue, ...ForceValue[]])
            .optional(),
        mechanic: z
            .enum(
                Object.values(MECHANIC) as [MechanicValue, ...MechanicValue[]],
            )
            .optional(),
        equipment: z
            .enum(
                Object.values(EQUIPMENT) as [
                    EquipmentValue,
                    ...EquipmentValue[],
                ],
            )
            .optional(),
        secondaryMuscles: z
            .array(
                z.enum(
                    Object.values(MUSCLE_GROUPS) as [
                        MuscleGroupValue,
                        ...MuscleGroupValue[],
                    ],
                ),
            )
            .optional()
            .default([]),
    })
    .strict();

export const updateExerciseSchema = createExerciseSchema.partial();
