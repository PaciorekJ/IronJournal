import { z } from 'zod';
import { SET_TYPES, SetTypeValue } from '~/constants/set-types';
import { WEIGHT_SELECTION_METHOD, WeightSelectionMethodValue } from '~/constants/weight-selection';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId');

const numberOrRangeSchema = z.union([z.number(), z.tuple([z.number(), z.number()])]);

const weightSelectionSchema = z.object({
  method: z.enum(
    Object.values(WEIGHT_SELECTION_METHOD) as [
      WeightSelectionMethodValue,
      ...WeightSelectionMethodValue[]
    ]
  ),
  value: z.number(),
});

const baseSetPrototypeSchema = z.object({
  workoutId: objectIdSchema,
  exercise: objectIdSchema,
  alternatives: z.array(objectIdSchema).optional().default([]),
  restDurationInSeconds: z.number().optional(),
  type: z.enum(Object.values(SET_TYPES) as [SetTypeValue, ...SetTypeValue[]]),
});

const straightSetSchema = baseSetPrototypeSchema.extend({
  type: z.literal(SET_TYPES.STRAIGHT_SET),
  reps: numberOrRangeSchema,
  sets: numberOrRangeSchema,
  weightSelection: weightSelectionSchema,
});

const dropSetSchema = baseSetPrototypeSchema.extend({
  type: z.literal(SET_TYPES.DROP_SET),
  drops: z.array(
    z.object({
      weightSelection: weightSelectionSchema,
      reps: numberOrRangeSchema,
    })
  ),
});

const supersetSchema = baseSetPrototypeSchema.extend({
  type: z.literal(SET_TYPES.SUPER_SET),
  exercises: z.array(
    z.object({
      exercise: objectIdSchema,
      reps: numberOrRangeSchema,
      restDuration: z.string().optional().default('0:30'),
      weightSelection: weightSelectionSchema,
    })
  ),
});

export const createSetPrototypeSchema = z.discriminatedUnion('type', [
  straightSetSchema,
  dropSetSchema,
  supersetSchema,
]);

const baseSetPrototypeSchemaPartial = baseSetPrototypeSchema.partial();

const partialStraightSetSchema = baseSetPrototypeSchemaPartial.extend({
  type: z.literal(SET_TYPES.STRAIGHT_SET).optional(),
  reps: numberOrRangeSchema.optional(),
  sets: numberOrRangeSchema.optional(),
  weightSelection: weightSelectionSchema.partial().optional(),
});

const partialDropSetSchema = baseSetPrototypeSchemaPartial.extend({
  type: z.literal(SET_TYPES.DROP_SET).optional(),
  drops: z
    .array(
      z.object({
        weightSelection: weightSelectionSchema.partial().optional(),
        reps: numberOrRangeSchema.optional(),
      })
    )
    .optional(),
});

const partialSupersetSchema = baseSetPrototypeSchemaPartial.extend({
  type: z.literal(SET_TYPES.SUPER_SET).optional(),
  exercises: z
    .array(
      z.object({
        exercise: objectIdSchema.optional(),
        reps: numberOrRangeSchema.optional(),
        restDuration: z.string().optional(),
        weightSelection: weightSelectionSchema.partial().optional(),
      })
    )
    .optional(),
});

export const updateSetPrototypeSchema = z.union([
  partialStraightSetSchema,
  partialDropSetSchema,
  partialSupersetSchema,
]);
