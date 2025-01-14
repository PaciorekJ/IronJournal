import { ObjectIdSchema } from "@paciorekj/iron-journal-shared";
import { z } from "zod";

const createOneRepMaxDataSchema = z
    .object({
        exercise: ObjectIdSchema,
        weight: z.number().min(0, "Weight must be a non-negative number"),
    })
    .strict();

const updateOneRepMaxDataSchema = z
    .object({
        exercise: ObjectIdSchema.optional(),
        weight: z.number().min(0, "Weight must be a non-negative number"),
    })
    .strict();

export interface IOneRepMaxCreateDTO
    extends Omit<z.infer<typeof createOneRepMaxDataSchema>, "userId"> {}
export interface IOneRepMaxUpdateDTO extends Partial<IOneRepMaxCreateDTO> {}

export { createOneRepMaxDataSchema, updateOneRepMaxDataSchema };
