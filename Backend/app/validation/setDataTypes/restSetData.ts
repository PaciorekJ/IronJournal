import { z } from "zod";
import { durationInSecondsSchema } from "../utils";

export const RestSetSchema = z.object({
    restDurationInSeconds: durationInSecondsSchema,
});
