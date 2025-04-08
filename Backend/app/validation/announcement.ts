import { z } from "zod";

const createAnnouncementSchema = z
    .object({
        title: z.string().min(1, "Title is required").trim(),
        description: z.string().min(1, "Description is required").trim(),
    })
    .strict();

const updateAnnouncementSchema = z
    .object({
        title: z.string().min(1, "Title cannot be empty").trim().optional(),
        description: z
            .string()
            .min(1, "Description cannot be empty")
            .trim()
            .optional(),
    })
    .strict();

export type IAnnouncementCreateDTO = z.infer<typeof createAnnouncementSchema>;
export type IAnnouncementUpdateDTO = z.infer<typeof updateAnnouncementSchema>;

export { createAnnouncementSchema, updateAnnouncementSchema };
