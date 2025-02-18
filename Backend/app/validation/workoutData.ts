import { ObjectIdSchema } from "@paciorekj/iron-journal-shared";
import { z } from "zod";
import { WORKOUT_DATA_STATUS } from "~/models/WorkoutData";

export const WorkoutStatusSchema = z.enum(
    Object.values(WORKOUT_DATA_STATUS) as [string, ...string[]],
);

export const createWorkoutDataSchema = z
    .object({
        workout: ObjectIdSchema.nullable(),
        setsData: z.array(ObjectIdSchema).default([]),
        status: WorkoutStatusSchema.default(WORKOUT_DATA_STATUS.ACTIVE),
    })
    .strict();

export const updateWorkoutDataSchema = z
    .object({
        workout: ObjectIdSchema.nullable().optional(),
        setsData: z.array(ObjectIdSchema).optional(),
        status: WorkoutStatusSchema.optional(),
    })
    .strict();

export type IWorkoutDataCreateDTO = z.infer<typeof createWorkoutDataSchema>;
export type IWorkoutDataUpdateDTO = z.infer<typeof updateWorkoutDataSchema>;
