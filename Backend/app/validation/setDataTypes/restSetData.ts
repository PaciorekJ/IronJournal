import { z } from "zod";
import { durationSchema } from "../utils";

export const RestSetDataSchema = z.object({
    restDurationInSeconds: durationSchema,
});
