import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, "Invalid ObjectId");

const createOneRepMaxDataSchema = z
    .object({
        exercise: objectIdSchema,
        weight: z.number().min(0, "Weight must be a non-negative number"),
    })
    .strict();

const updateOneRepMaxDataSchema = z
    .object({
        exercise: objectIdSchema.optional(),
        weight: z
            .number()
            .min(0, "Weight must be a non-negative number")
            .optional(),
    })
    .strict();

export interface IOneRepMaxCreateDTO
    extends Omit<z.infer<typeof createOneRepMaxDataSchema>, "userId"> {}
export interface IOneRepMaxUpdateDTO extends Partial<IOneRepMaxCreateDTO> {}

export { createOneRepMaxDataSchema, updateOneRepMaxDataSchema };
