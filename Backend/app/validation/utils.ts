import { z } from "zod";

export const distanceUnitsSchema = z
    .object({
        cm: z.number().nonnegative().optional(),
        m: z.number().nonnegative().optional(),
        km: z.number().nonnegative().optional(),
        inches: z.number().nonnegative().optional(),
        ft: z.number().nonnegative().optional(),
        mi: z.number().nonnegative().optional(),
    })
    .strict()
    .refine(
        (data) => Object.values(data).some((value) => value !== undefined),
        { message: "At least one distance unit must have a non-falsy value" },
    );

export const weightUnitsSchema = z
    .object({
        kg: z.number().nonnegative().optional(),
        lb: z.number().nonnegative().optional(),
    })
    .strict()
    .refine(
        (data) => Object.values(data).some((value) => value !== undefined),
        { message: "At least one weight unit must have a non-falsy value" },
    );

export const volumeUnitsSchema = z
    .object({
        ml: z.number().nonnegative().optional(),
        l: z.number().nonnegative().optional(),
        fluidOz: z.number().nonnegative().optional(),
        gal: z.number().nonnegative().optional(),
    })
    .strict()
    .refine(
        (data) => Object.values(data).some((value) => value !== undefined),
        { message: "At least one volume unit must have a non-falsy value" },
    );

export const durationSchema = z
    .number()
    .min(0, "Duration must be a non-negative number");

export const repsSchema = z
    .number()
    .min(0, "Reps must be a non-negative number");

export const rpeSchema = z
    .number()
    .min(1, "RPE must be between 1 and 10")
    .max(10, "RPE must be between 1 and 10");
