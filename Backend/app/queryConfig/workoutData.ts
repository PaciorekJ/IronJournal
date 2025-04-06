import { z } from "zod";
import { WORKOUT_DATA_STATUS } from "~/models/WorkoutData";
import { addPaginationAndSorting } from "./utils";

// Workout Data Query Configuration

export const workoutDataQueryConfig = addPaginationAndSorting({
    createdAt: {
        isArray: false,
        constructor: (value: string) => new Date(value),
        schema: z.date(),
    },
    status: {
        isArray: false,
        constructor: String,
        schema: z.enum(
            Object.values(WORKOUT_DATA_STATUS) as [string, ...string[]],
        ),
    },
    workout: {
        isArray: false,
        constructor: String,
        schema: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
    },
});
