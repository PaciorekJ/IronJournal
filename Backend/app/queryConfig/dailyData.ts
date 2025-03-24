import { z } from "node_modules/zod/lib/external";
import { IBuildQueryConfig, addPaginationAndSorting } from "./utils";

// Daily Data Query Configuration

export const dailyDataQueryConfig: IBuildQueryConfig = addPaginationAndSorting({
    createdAt: {
        isArray: false,
        constructor: (value: string) => {
            const date = new Date(value);
            return new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
            );
        },
        schema: z.date(),
    },
});
