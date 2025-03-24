import { z } from "zod";
import { addPaginationAndSorting } from "./utils";

export const reportQueryConfig = addPaginationAndSorting({
    type: {
        isArray: false,
        constructor: String,
        schema: z.enum(["Program", "Workout", "User"]),
    },
    status: {
        isArray: false,
        constructor: String,
        schema: z.enum(["pending", "reviewed", "closed"]),
    },
    reason: {
        isArray: false,
        constructor: String,
        regex: (value: string) => new RegExp(value, "i"),
        schema: z.string().min(1),
    },
    createdAt: {
        isArray: false,
        constructor: (value: string) => new Date(value),
        schema: z.preprocess((arg) => {
            if (typeof arg === "string" || arg instanceof Date)
                return new Date(arg);
            return arg;
        }, z.date()),
    },
});
