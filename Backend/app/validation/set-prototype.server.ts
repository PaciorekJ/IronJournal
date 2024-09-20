import { z } from "zod";
import { SET_TYPES, SetTypeValue } from "~/constants/set-types";
import {
    WEIGHT_SELECTION_METHOD,
    WeightSelectionMethodValue,
} from "~/constants/weight-selection";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, "Invalid ObjectId");

const numberOrRangeSchema = z
    .union([z.number(), z.tuple([z.number(), z.number()])])
    .refine(
        (val) => {
            if (typeof val === "number") {
                return val > 0;
            } else if (Array.isArray(val)) {
                return val[0] > 0 && val[1] > 0 && val[0] <= val[1];
            }
            return false;
        },
        {
            message:
                "Value must be a positive number or a range of positive numbers where the first is less than or equal to the second",
        },
    );

const weightSelectionSchema = z
    .object({
        method: z.enum(
            Object.values(WEIGHT_SELECTION_METHOD) as [
                WeightSelectionMethodValue,
                ...WeightSelectionMethodValue[],
            ],
        ),
        value: z.number().positive(),
    })
    .strict();

const baseSetPrototypeSchema = z
    .object({
        workoutId: objectIdSchema,
        exercise: objectIdSchema,
        alternatives: z.array(objectIdSchema).optional().default([]),
        restDurationInSeconds: z.number().optional(),
        type: z.enum(
            Object.values(SET_TYPES) as [SetTypeValue, ...SetTypeValue[]],
        ),
    })
    .strict();

const straightSetSchema = baseSetPrototypeSchema
    .extend({
        type: z.literal(SET_TYPES.STRAIGHT_SET),
        reps: numberOrRangeSchema,
        sets: numberOrRangeSchema,
        weightSelection: weightSelectionSchema,
    })
    .strict();

const dropSetSchema = baseSetPrototypeSchema
    .extend({
        type: z.literal(SET_TYPES.DROP_SET),
        drops: z.array(
            z.object({
                weightSelection: weightSelectionSchema,
                reps: numberOrRangeSchema,
            }),
        ),
    })
    .strict();

const supersetSchema = baseSetPrototypeSchema
    .extend({
        type: z.literal(SET_TYPES.SUPER_SET),
        exercises: z.array(
            z.object({
                exercise: objectIdSchema,
                reps: numberOrRangeSchema,
                restDurationInSeconds: z.string().optional().default("0:30"),
                weightSelection: weightSelectionSchema,
            }),
        ),
    })
    .strict();

export const createSetPrototypeSchema = z.discriminatedUnion("type", [
    straightSetSchema,
    dropSetSchema,
    supersetSchema,
]);

export const updateSetPrototypeSchema = z.discriminatedUnion("type", [
    straightSetSchema.partial().required({ type: true }),
    dropSetSchema.partial().required({ type: true }),
    supersetSchema.partial().required({ type: true }),
]);

export type CreateSetPrototypeInput = z.infer<typeof createSetPrototypeSchema>;
export type UpdateSetPrototypeInput = z.infer<typeof updateSetPrototypeSchema>;
