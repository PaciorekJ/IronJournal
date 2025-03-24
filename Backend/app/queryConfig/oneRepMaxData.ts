import { ObjectIdSchema } from "@paciorekj/iron-journal-shared";
import { z } from "node_modules/zod/lib/external";
import { addPaginationAndSorting } from "./utils";

export const oneRepMaxQueryConfig = addPaginationAndSorting({
    exercise: {
        isArray: false,
        constructor: String,
        schema: ObjectIdSchema,
    },
    weight: {
        isArray: false,
        constructor: Number,
        schema: z.number().min(0, "Weight must be non-negative"),
    },
    createdAt: {
        isArray: false,
        constructor: Date,
        schema: z.date(),
    },
});
