import { z } from "zod";

const createAnnouncementSchema = z
    .object({
        title: z.string().min(1, "Title is required").trim(),
        message: z.string().min(1, "Message is required").trim(),
    })
    .strict();

const updateAnnouncementSchema = z
    .object({
        title: z.string().min(1, "Title cannot be empty").trim().optional(),
        message: z.string().min(1, "Message cannot be empty").trim().optional(),
    })
    .strict();

export type IAnnouncementCreateDTO = z.infer<typeof createAnnouncementSchema>;
export type IAnnouncementUpdateDTO = z.infer<typeof updateAnnouncementSchema>;

export { createAnnouncementSchema, updateAnnouncementSchema };
