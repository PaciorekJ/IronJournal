export const LANGUAGE = {
    GERMAN: "de",
    FRENCH: "fr",
    SPANISH: "es",
    ENGLISH: "en",
} as const;

export type LanguageKey = keyof typeof LANGUAGE;
export type LanguageValue = (typeof LANGUAGE)[LanguageKey];
