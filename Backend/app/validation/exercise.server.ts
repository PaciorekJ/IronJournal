import {
    CATEGORY,
    CategoryKey,
    EQUIPMENT,
    EquipmentKey,
    FORCE,
    ForceKey,
    LEVEL,
    LevelKey,
    MECHANIC,
    MechanicKey,
    MUSCLE_GROUP,
    MuscleGroupKey,
} from "@paciorekj/iron-journal-shared/constants";
import { z } from "zod";

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

export interface IExerciseCreateDTO
    extends z.infer<typeof createExerciseSchema> {}
export interface IExerciseUpdateDTO
    extends z.infer<typeof updateExerciseSchema> {}
