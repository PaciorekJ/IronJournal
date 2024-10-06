import { z } from "zod";
import { LANGUAGE, LanguageKey } from "~/constants/language";

const safeUsernamePattern = /^[a-zA-Z0-9_]+$/;

export const languagePreferenceSchema = z.enum(
    Object.keys(LANGUAGE) as [LanguageKey, ...LanguageKey[]],
    { message: "Invalid language preference" },
);

export const createUserSchema = z
    .object({
        username: z
            .string()
            .min(1, "Username is required")
            .max(30, "Username should not exceed 30 characters")
            .regex(
                safeUsernamePattern,
                "Username can only contain letters, numbers, and underscores",
            )
            .trim(),
        firebaseId: z.string().min(1, "Firebase ID is required").trim(),
        languagePreference: languagePreferenceSchema,
    })
    .strict();

export const updateUserSchema = createUserSchema
    .omit({ firebaseId: true })
    .partial();

export type IUserCreateDTO = z.infer<typeof createUserSchema>;
export type IUserUpdateDTO = z.infer<typeof updateUserSchema>;
