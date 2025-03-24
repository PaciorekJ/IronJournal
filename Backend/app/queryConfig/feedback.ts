import { z } from "zod";
import { addPaginationAndSorting } from "./utils";

// Feedback Query Configuration

export const feedbackQueryConfig = addPaginationAndSorting({
    subject: {
        isArray: false,
        constructor: String,
        regex: (value: string) => new RegExp(value, "i"),
        schema: z.string().min(1),
    },
    rating: {
        isArray: false,
        constructor: Number,
        schema: z.number().min(1).max(5),
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
