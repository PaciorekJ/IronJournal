import {
    SET_TYPE,
    SetTypeKey,
    WEIGHT_SELECTION_METHOD,
    WeightSelectionMethodKey,
} from "@paciorekj/iron-journal-shared/constants";
import { z } from "zod";

// Common types and constants
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, "Invalid ObjectId");

const numberOrRangeSchema = z
    .union([
        z.number().positive(),
        z.tuple([z.number().positive(), z.number().positive()]),
    ])
    .refine(
        (val) => {
            if (typeof val === "number") return true;
            if (Array.isArray(val)) return val[0] <= val[1];
            return false;
        },
        { message: "Must be a positive number or an ascending range." },
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

const straightSetEntrySchema = z.object({
    reps: numberOrRangeSchema,
    weightSelection: weightSelectionSchema.optional(),
});

const dropSetEntrySchema = z.object({
    loadReductionPercent: z.number().min(0).max(100),
    assisted: z.boolean().optional(),
});

const restPauseSetEntrySchema = z.object({
    reps: numberOrRangeSchema,
    restDurationInSeconds: numberOrRangeSchema,
});

const pyramidSetEntrySchema = z.object({
    reps: numberOrRangeSchema,
    weightSelection: weightSelectionSchema.optional(),
});

const isometricSetEntrySchema = z.object({
    durationInSeconds: numberOrRangeSchema,
    weightSelection: weightSelectionSchema.optional(),
});

const amrapSetEntrySchema = z.object({
    timeFrameInSeconds: numberOrRangeSchema.optional(),
    weightSelection: weightSelectionSchema.optional(),
});

// Define setPrototypeSchema initially without recursion
const baseSetPrototypeSchema = z.object({
    type: z.enum(Object.keys(SET_TYPE) as [SetTypeKey, ...SetTypeKey[]]),
    tempo: tempoSchema.optional(),

    straightSet: z
        .object({
            exercise: objectIdSchema,
            sets: z.array(straightSetEntrySchema),
        })
        .optional(),

    dropSet: z
        .object({
            exercise: objectIdSchema,
            initialWeightSelection: weightSelectionSchema,
            sets: z.array(dropSetEntrySchema),
        })
        .optional(),

    restPauseSet: z
        .object({
            exercise: objectIdSchema,
            weightSelection: weightSelectionSchema.optional(),
            sets: z.array(restPauseSetEntrySchema),
        })
        .optional(),

    pyramidSet: z
        .object({
            exercise: objectIdSchema,
            sets: z.array(pyramidSetEntrySchema),
        })
        .optional(),

    isometricSet: z
        .object({
            exercise: objectIdSchema,
            sets: z.array(isometricSetEntrySchema),
        })
        .optional(),

    amrapSet: z
        .object({
            exercise: objectIdSchema,
            sets: z.array(amrapSetEntrySchema),
        })
        .optional(),
});

// Extend base schema with recursive superset
const setPrototypeSchema = baseSetPrototypeSchema.extend({
    superSet: z
        .object({
            sets: z.array(z.lazy(() => baseSetPrototypeSchema)),
        })
        .optional(),
});

export const createSetPrototypeSchema = setPrototypeSchema.superRefine(
    (data, ctx) => {
        switch (SET_TYPE[data.type]) {
            case SET_TYPE.STRAIGHT_SET:
                if (!data.straightSet?.exercise || !data.straightSet?.sets) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message:
                            "Straight Set must have 'exercise' and 'sets'.",
                    });
                }
                break;
            case SET_TYPE.DROP_SET:
                if (
                    !data.dropSet?.exercise ||
                    !data.dropSet?.initialWeightSelection ||
                    !data.dropSet?.sets
                ) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message:
                            "Drop Set must have 'exercise', 'initialWeightSelection', and 'sets'.",
                    });
                }
                break;
            case SET_TYPE.REST_PAUSE_SET:
                if (!data.restPauseSet?.exercise || !data.restPauseSet?.sets) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message:
                            "Rest-Pause Set must have 'exercise' and 'sets'.",
                    });
                }
                break;
            case SET_TYPE.PYRAMID_SET:
            case SET_TYPE.REVERSE_PYRAMID_SET:
            case SET_TYPE.NON_LINEAR_PYRAMID_SET:
                if (!data.pyramidSet?.exercise || !data.pyramidSet?.sets) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Pyramid Set must have 'exercise' and 'sets'.",
                    });
                }
                break;
            case SET_TYPE.ISOMETRIC_SET:
                if (!data.isometricSet?.exercise || !data.isometricSet?.sets) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message:
                            "Isometric Set must have 'exercise' and 'sets'.",
                    });
                }
                break;
            case SET_TYPE.AMRAP_SET:
                if (!data.amrapSet?.exercise || !data.amrapSet?.sets) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "AMRAP Set must have 'exercise' and 'sets'.",
                    });
                }
                break;
            case SET_TYPE.SUPER_SET:
                if (!data.superSet?.sets || data.superSet?.sets.length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Superset must have at least one 'set'.",
                    });
                }
                break;
            default:
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Invalid set type '${data.type}'.`,
                });
                break;
        }
    },
);

export const updateSetPrototypeSchema = setPrototypeSchema.partial().extend({
    type: z.enum(Object.keys(SET_TYPE) as [SetTypeKey, ...SetTypeKey[]]),
});

export type ISetPrototypeCreateDTO = z.infer<typeof createSetPrototypeSchema>;
export type ISetPrototypeUpdateDTO = z.infer<typeof updateSetPrototypeSchema>;
