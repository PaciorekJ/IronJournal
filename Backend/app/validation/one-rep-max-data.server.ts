import { ObjectIdSchema } from "@paciorekj/iron-journal-shared";
import { z } from "zod";
import { weightUnitsSchema } from "./utils";

const createOneRepMaxDataSchema = z
    .object({
        exercise: ObjectIdSchema,
        weight: weightUnitsSchema,
        notes: z.string().optional(),
    })
    .strict();

const updateOneRepMaxDataSchema = z
    .object({
        exercise: ObjectIdSchema.optional(),
        weight: weightUnitsSchema.optional(),
        notes: z.string().optional(),
    })
    .strict();

export interface IOneRepMaxCreateDTO
    extends Omit<z.infer<typeof createOneRepMaxDataSchema>, "userId"> {}
export interface IOneRepMaxUpdateDTO extends Partial<IOneRepMaxCreateDTO> {}

export { createOneRepMaxDataSchema, updateOneRepMaxDataSchema };
