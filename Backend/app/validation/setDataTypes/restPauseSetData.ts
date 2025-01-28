import {
    ObjectIdSchema,
    RestPauseSetEntrySchema,
    SET_TYPE,
    WeightSelectionSchema,
} from "@paciorekj/iron-journal-shared";
import { z } from "zod";
import { durationSchema, repsSchema } from "../utils";

export const RestPauseSetDataEntrySchema = z.object({
    reps: repsSchema,
    restDurationInSeconds: durationSchema,
});

export const RestPauseSetDataSchema = z.object({
    type: z.literal(SET_TYPE.REST_PAUSE_SET),
    exercise: ObjectIdSchema,
    weight: WeightSelectionSchema,
    setData: z.array(RestPauseSetEntrySchema),
});
