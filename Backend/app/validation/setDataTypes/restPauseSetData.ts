import {
    ObjectIdSchema,
    RestPauseSetEntrySchema,
    SET_TYPE,
    WeightSelectionSchema,
} from "@paciorekj/iron-journal-shared";
import { z } from "zod";
import { durationInSecondsSchema } from "../utils";

export const RestPauseSetDataEntrySchema = z.object({
    reps: z.number().min(0, "Reps must be a non-negative number"),
    restDurationInSeconds: durationInSecondsSchema,
});

export const RestPauseSetDataSchema = z.object({
    type: z.literal(SET_TYPE.REST_PAUSE_SET),
    exercise: ObjectIdSchema,
    weight: WeightSelectionSchema,
    sets: z.array(RestPauseSetEntrySchema),
});
