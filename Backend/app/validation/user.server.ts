import { ObjectIdSchema } from "@paciorekj/iron-journal-shared";
import {
    LANGUAGE,
    LanguageKey,
} from "@paciorekj/iron-journal-shared/constants";
import { CensorTier } from "censor-sensor";
import { z } from "zod";

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
        activeProgram: ObjectIdSchema.optional(),
        timezone: z.string().min(1, "Timezone is required").trim(),
        firebaseId: z.string().min(1, "Firebase ID is required").trim(),
        languagePreference: languagePreferenceSchema,
        acceptedProfanityTiers: z
            .array(
                z.enum(
                    [...Object.values(CensorTier)] as [string, ...string[]],
                    {
                        message: "Invalid profanity tier",
                    },
                ),
            )
            .optional()
            .default([]),
        measurementSystemPreference: z.enum(["METRIC", "IMPERIAL"], {
            message: "Invalid measurement system preference",
        }),
    })
    .strict();

export const updateUserSchema = createUserSchema
    .omit({ firebaseId: true })
    .partial();

export type IUserCreateDTO = z.infer<typeof createUserSchema>;
export type IUserUpdateDTO = z.infer<typeof updateUserSchema>;
