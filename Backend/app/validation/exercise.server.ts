import { z } from "zod";
import { CATEGORY, CategoryKey } from "~/constants/category";
import { EQUIPMENT, EquipmentKey } from "~/constants/equipment";
import { FORCE, ForceKey } from "~/constants/force";
import { LEVEL, LevelKey } from "~/constants/level";
import { MECHANIC, MechanicKey } from "~/constants/mechanic";
import { MUSCLE_GROUP, MuscleGroupKey } from "~/constants/muscle-group";

// Creation Schema for Exercise
export const createExerciseSchema = z
    .object({
        name: z.string(),
        level: z.enum(Object.keys(LEVEL) as [LevelKey, ...LevelKey[]]),
        primaryMuscles: z.array(
            z.enum(
                Object.keys(MUSCLE_GROUP) as [
                    MuscleGroupKey,
                    ...MuscleGroupKey[],
                ],
            ),
        ),
        instructions: z.array(z.string()),
        category: z.enum(
            Object.keys(CATEGORY) as [CategoryKey, ...CategoryKey[]],
        ),
        images: z.array(z.string()),
        id: z.string(),
        force: z
            .enum(Object.keys(FORCE) as [ForceKey, ...ForceKey[]])
            .optional(),
        mechanic: z
            .enum(Object.keys(MECHANIC) as [MechanicKey, ...MechanicKey[]])
            .optional(),
        equipment: z
            .enum(Object.keys(EQUIPMENT) as [EquipmentKey, ...EquipmentKey[]])
            .optional(),
        secondaryMuscles: z
            .array(
                z.enum(
                    Object.keys(MUSCLE_GROUP) as [
                        MuscleGroupKey,
                        ...MuscleGroupKey[],
                    ],
                ),
            )
            .optional()
            .default([]),
    })
    .strict();

export const updateExerciseSchema = createExerciseSchema.partial();
