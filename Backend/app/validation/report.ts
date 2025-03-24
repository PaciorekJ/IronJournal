import { ObjectIdSchema } from "@paciorekj/iron-journal-shared";
import { z } from "zod";

const createReportSchema = z
    .object({
        reported: ObjectIdSchema,
        type: z.enum(["Program", "Workout", "User"]),
        reason: z.string().min(1, "Reason is required"),
        details: z.string().optional(),
    })
    .strict();

const updateReportSchema = z
    .object({
        reason: z.string().min(1, "Reason cannot be empty").optional(),
        details: z.string().optional(),
        status: z.enum(["pending", "reviewed", "closed"]).optional(),
    })
    .strict();

export type IReportCreateDTO = z.infer<typeof createReportSchema>;
export type IReportUpdateDTO = z.infer<typeof updateReportSchema>;

export { createReportSchema, updateReportSchema };
