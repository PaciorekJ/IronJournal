import { z } from "zod";
import { SET_TYPE, SetTypeKey } from "~/constants/set-type";
import {
    WEIGHT_SELECTION_METHOD,
    WeightSelectionMethodKey,
} from "~/constants/weight-selection";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, "Invalid ObjectId");

const numberOrRangeSchema = z
    .union([
        z.number().positive(),
        z.tuple([z.number().positive(), z.number().positive()]),
    ])
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
            Object.keys(WEIGHT_SELECTION_METHOD) as [
                WeightSelectionMethodKey,
                ...WeightSelectionMethodKey[],
            ],
        ),
        value: z.number().positive(),
    })
    .strict();

const baseSetPrototypeSchema = z
    .object({
        type: z.enum(Object.keys(SET_TYPE) as [SetTypeKey, ...SetTypeKey[]]),
        exerciseId: objectIdSchema.optional(),
        alternatives: z.array(objectIdSchema).optional().default([]),
        restDurationInSeconds: z.number().nonnegative().optional(),
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
                    weightSelection: weightSelectionSchema.optional(),
                    reps: numberOrRangeSchema,
                }),
            )
            .optional(),

        // Fields for Superset
        exercises: z
            .array(
                z.object({
                    tempo: tempoSchema.optional(),
                    exerciseId: objectIdSchema,
                    reps: numberOrRangeSchema,
                    restDurationInSeconds: z.number().nonnegative().optional(),
                    weightSelection: weightSelectionSchema.optional(),
                }),
            )
            .optional(),
    })
    .strict();

export const createSetPrototypeSchema = setPrototypeSchema.superRefine(
    (data, ctx) => {
        switch (SET_TYPE[data.type]) {
            case SET_TYPE.SET_PROTOTYPE_STRAIGHT_SET:
                if (!data.exerciseId) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Straight Set must have 'exerciseId'.",
                    });
                }
                if (data.reps === undefined || data.sets === undefined) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message:
                            "Straight Set must have 'reps', 'sets', and 'weightSelection'.",
                    });
                }
                break;
            case SET_TYPE.SET_PROTOTYPE_DROP_SET:
                if (!data.exerciseId) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Drop Set must have 'exerciseId'.",
                    });
                }
                if (!data.drops || data.drops.length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message:
                            "Drop Set must have at least one 'drop' with 'reps' and 'weightSelection'.",
                    });
                }
                break;
            case SET_TYPE.SET_PROTOTYPE_SUPER_SET:
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
    type: z.enum(Object.keys(SET_TYPE) as [SetTypeKey, ...SetTypeKey[]]),
});

export type CreateSetPrototypeInput = z.infer<typeof createSetPrototypeSchema>;
export type UpdateSetPrototypeInput = z.infer<typeof updateSetPrototypeSchema>;
