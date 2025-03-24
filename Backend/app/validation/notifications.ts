import { ObjectIdSchema } from "@paciorekj/iron-journal-shared";
import { z } from "zod";

const createNotificationSchema = z
    .object({
        user: ObjectIdSchema,
        title: z.string().min(1, "Title is required").trim(),
        message: z.string().min(1, "Message is required"),
        type: z.enum(["info", "warning"]),
        read: z.boolean().optional().default(false),
    })
    .strict();

const updateNotificationSchema = z
    .object({
        title: z.string().min(1, "Title is required").trim().optional(),
        message: z.string().min(1, "Message is required").trim().optional(),
        type: z.enum(["info", "warning"]).optional(),
        read: z.boolean().optional(),
    })
    .strict();

export type INotificationCreateDTO = z.infer<typeof createNotificationSchema>;
export type INotificationUpdateDTO = z.infer<typeof updateNotificationSchema>;

export { createNotificationSchema, updateNotificationSchema };
