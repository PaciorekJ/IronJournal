import { ObjectIdSchema } from "@paciorekj/iron-journal-shared";
import {
    DAYS_OF_WEEK,
    DaysOfWeekKey,
    FOCUS_AREA,
    FocusAreasKey,
    LANGUAGE,
    LanguageKey,
    SCHEDULE_TYPE,
    ScheduleTypeKey,
    TARGET_AUDIENCE,
    TargetAudienceKey,
} from "@paciorekj/iron-journal-shared/constants";
import { z } from "zod";

const workoutScheduleItemSchema = z
    .object({
        day: z.union([
            z.enum(
                Object.keys(DAYS_OF_WEEK) as [
                    DaysOfWeekKey,
                    ...DaysOfWeekKey[],
                ],
            ),
            z.number(),
        ]),
        workoutIds: z.array(ObjectIdSchema).optional(),
        isRestDay: z.boolean().optional(),
    })
    .strict()
    .refine(
        (data) =>
            (data.workoutIds &&
                data.workoutIds.length > 0 &&
                !data.isRestDay) ||
            ((!data.workoutIds || data.workoutIds.length === 0) &&
                data.isRestDay),
        {
            message:
                "Either 'workoutIds' must be a non-empty array or 'isRestDay' must be true, but not both.",
        },
    );

const tempCreateProgramSchema = z
    .object({
        name: z.string(),
        originalLanguage: z.enum(
            Object.keys(LANGUAGE) as [LanguageKey, ...LanguageKey[]],
        ),
        description: z.string().optional(),
        workoutSchedule: z.array(workoutScheduleItemSchema).optional(),
        repetitions: z.number().nonnegative().optional().default(0),
        notes: z.string().optional(),
        isPublic: z.boolean().optional().default(false),
        scheduleType: z.enum(
            Object.keys(SCHEDULE_TYPE) as [
                ScheduleTypeKey,
                ...ScheduleTypeKey[],
            ],
        ),
        focusAreas: z
            .array(
                z.enum(
                    Object.keys(FOCUS_AREA) as [
                        FocusAreasKey,
                        ...FocusAreasKey[],
                    ],
                ),
            )
            .optional(),
        targetAudience: z
            .enum(
                Object.keys(TARGET_AUDIENCE) as [
                    TargetAudienceKey,
                    ...TargetAudienceKey[],
                ],
            )
            .optional(),
    })
    .strict();

export const createProgramSchema = tempCreateProgramSchema;
export const updateProgramSchema = tempCreateProgramSchema.partial();

// TYPES for expected inputs to CRUD Operations
export interface IProgramCreateDTO
    extends Omit<
        z.infer<typeof createProgramSchema>,
        "userId" | "createdAt" | "updatedAt"
    > {}
export interface IProgramUpdateDTO extends Partial<IProgramCreateDTO> {}
