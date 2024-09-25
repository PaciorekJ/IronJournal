// setPrototype.schema.ts

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

const tempoSchema = z
    .object({
        eccentric: z.number().nonnegative(),
        bottomPause: z.number().nonnegative(),
        concentric: z.number().nonnegative(),
        topPause: z.number().nonnegative(),
    })
    .partial()
    .strict();

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
        type: z.enum(
            Object.values(SET_TYPES) as [SetTypeValue, ...SetTypeValue[]],
        ),
        exercise: objectIdSchema.optional(),
        alternatives: z.array(objectIdSchema).optional().default([]),
        restDurationInSeconds: z.number().optional(),
    })
    .strict();

const setPrototypeSchema = baseSetPrototypeSchema
    .extend({
        // Fields for Straight Set
        reps: numberOrRangeSchema.optional(),
        sets: numberOrRangeSchema.optional(),
        tempo: tempoSchema.optional(),
        weightSelection: weightSelectionSchema.optional(),

        // Fields for Drop Set
        drops: z
            .array(
                z.object({
                    tempo: tempoSchema.optional(),
                    weightSelection: weightSelectionSchema,
                    reps: numberOrRangeSchema,
                }),
            )
            .optional(),

        // Fields for Superset
        exercises: z
            .array(
                z.object({
                    tempo: tempoSchema.optional(),
                    exercise: objectIdSchema,
                    reps: numberOrRangeSchema,
                    restDurationInSeconds: z.number().optional(),
                    weightSelection: weightSelectionSchema,
                }),
            )
            .optional(),
    })
    .strict();

export const createSetPrototypeSchema = setPrototypeSchema.superRefine(
    (data, ctx) => {
        // Custom validation based on 'type'
        switch (data.type) {
            case SET_TYPES.STRAIGHT_SET:
                if (
                    !data.reps ||
                    !data.sets ||
                    !data.weightSelection ||
                    !data.exercise
                ) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message:
                            "Straight Set must have 'exercise', 'reps', 'sets', and 'weightSelection'.",
                    });
                }
                break;
            case SET_TYPES.DROP_SET:
                if (!data.drops || data.drops.length === 0 || !data.exercise) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message:
                            "Drop Set must have 'exercise' and at least one 'drop' with 'reps' and 'weightSelection'.",
                    });
                }
                break;
            case SET_TYPES.SUPER_SET:
                if (!data.exercises || data.exercises.length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message:
                            "Superset must have at least one 'exercise' with 'reps' and 'weightSelection'.",
                    });
                }
                break;
            default:
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Invalid 'type' field.",
                });
                break;
        }
    },
);

export const updateSetPrototypeSchema = setPrototypeSchema.partial().extend({
    type: z.enum(Object.values(SET_TYPES) as [SetTypeValue, ...SetTypeValue[]]),
});

export type CreateSetPrototypeInput = z.infer<typeof createSetPrototypeSchema>;
export type UpdateSetPrototypeInput = z.infer<typeof updateSetPrototypeSchema>;
