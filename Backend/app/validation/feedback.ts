import { z } from "zod";

const createFeedbackSchema = z
    .object({
        subject: z.string().min(1, "Subject is required").trim(),
        message: z.string().min(1, "Message is required").trim(),
        rating: z
            .number()
            .min(1, "Rating must be at least 1")
            .max(5, "Rating cannot be more than 5")
            .optional(),
    })
    .strict();

const updateFeedbackSchema = z
    .object({
        subject: z.string().min(1, "Subject is required").trim().optional(),
        message: z.string().min(1, "Message is required").trim().optional(),
        rating: z
            .number()
            .min(1, "Rating must be at least 1")
            .max(5, "Rating cannot be more than 5")
            .optional(),
    })
    .strict();

export type IFeedbackCreateDTO = z.infer<typeof createFeedbackSchema>;
export type IFeedbackUpdateDTO = z.infer<typeof updateFeedbackSchema>;

export { createFeedbackSchema, updateFeedbackSchema };
