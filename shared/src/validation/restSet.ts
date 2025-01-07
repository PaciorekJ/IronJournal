import { z } from "zod";
import { NumberOrRangeSchema } from "./utils";

// Cardio Set Validator
export const RestSetSchema = z.object({
    restDurationInSeconds: NumberOrRangeSchema.optional(),
});

export type IRestSet = z.infer<typeof RestSetSchema>;
