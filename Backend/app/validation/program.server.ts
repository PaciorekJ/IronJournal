import { z } from 'zod';
import { DAYS_OF_WEEK, DaysOfWeekValue } from '~/constants/days-of-week';
import { FOCUS_AREAS, FocusAreasValue } from '~/constants/focus-area';
import { SCHEDULE_TYPE, ScheduleTypeValue } from '~/constants/schedule-types';
import { TARGET_AUDIENCE, TargetAudienceValue } from '~/constants/target-audiences';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId');

const cardioRecommendationSchema = z.object({
  frequency: z.string(),
  durationMinutes: z.number(),
  type: z.string(),
});

const workoutScheduleItemSchema = z.object({
  day: z.union([
    z.enum(Object.values(DAYS_OF_WEEK) as [DaysOfWeekValue, ...DaysOfWeekValue[]]),
    z.number(),
  ]),
  workoutId: objectIdSchema.optional(),
  isRestDay: z.boolean().optional(),
});

export const createProgramSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  workoutSchedule: z.array(workoutScheduleItemSchema),
  durationInDays: z.number().optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
  scheduleType: z.enum(
    Object.values(SCHEDULE_TYPE) as [ScheduleTypeValue, ...ScheduleTypeValue[]]
  ),
  focusAreas: z
    .array(z.enum(Object.values(FOCUS_AREAS) as [FocusAreasValue, ...FocusAreasValue[]]))
    .optional(),
  targetAudience: z
    .enum(Object.values(TARGET_AUDIENCE) as [TargetAudienceValue, ...TargetAudienceValue[]])
    .optional(),
  cardioRecommendations: cardioRecommendationSchema.optional(),
  progressionStrategy: z.string().optional(),
});

// Update Schema for Program (all fields optional)
export const updateProgramSchema = createProgramSchema.partial();
