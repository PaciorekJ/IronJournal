import { z } from "zod";
import { IBuildQueryConfig, addPaginationAndSorting } from "./utils";

// User Query Configuration

export const userQueryConfig: IBuildQueryConfig = addPaginationAndSorting({
    username: {
        isArray: false,
        constructor: String,
        regex: (value: string) => new RegExp(value, "i"),
        schema: z.string().min(1),
    },
});
