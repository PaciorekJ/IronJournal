import { z } from "zod";
import { addPaginationAndSorting } from "./utils";

export const notificationQueryConfig = addPaginationAndSorting({
    type: {
        isArray: false,
        constructor: String,
        schema: z.enum(["info", "warning"]),
    },
    isRead: {
        isArray: false,
        constructor: (value: string) => value === "true",
        schema: z.boolean(),
        getFieldPath: () => "read",
    },
});
