import { z } from "zod";
import {
    distanceUnitsSchema,
    volumeUnitsSchema,
    weightUnitsSchema,
} from "./utils";

export const bodyMeasurementSchema = z
    .object({
        neck: distanceUnitsSchema.optional(),
        bicepLeft: distanceUnitsSchema.optional(),
        bicepRight: distanceUnitsSchema.optional(),
        forearmLeft: distanceUnitsSchema.optional(),
        forearmRight: distanceUnitsSchema.optional(),
        chest: distanceUnitsSchema.optional(),
        stomach: distanceUnitsSchema.optional(),
        waist: distanceUnitsSchema.optional(),
        thighLeft: distanceUnitsSchema.optional(),
        thighRight: distanceUnitsSchema.optional(),
        calfLeft: distanceUnitsSchema.optional(),
        calfRight: distanceUnitsSchema.optional(),
    })
    .strict();

const subjectiveMoodSchema = z
    .object({
        mentalState: z.number().min(1).max(10).optional(),
        muscleSoreness: z.number().min(1).max(10).optional(),
        energyLevel: z.number().min(1).max(10).optional(),
    })
    .strict();

const dailyDataSchema = z
    .object({
        subjectiveMood: subjectiveMoodSchema.optional(),
        waterIntake: volumeUnitsSchema.optional(),
        bodyWeight: weightUnitsSchema.optional(),
        bodyFatPercentage: z.number().nonnegative().optional(),
        bodyMeasurements: bodyMeasurementSchema.optional(),
        createdAt: z
            .string()
            .refine(
                (date) => !isNaN(Date.parse(date)),
                "Invalid date format for createdAt",
            ),
    })
    .strict();

export const createDailyDataSchema = dailyDataSchema;
export const updateDailyDataSchema = dailyDataSchema;

export interface IDailyDataCreateDTO
    extends z.infer<typeof createDailyDataSchema> {}
export interface IDailyDataUpdateDTO
    extends z.infer<typeof updateDailyDataSchema> {}
