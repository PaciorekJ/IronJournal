export const LANGUAGE = {
    es: "Español",
    en: "English",
} as const;

export type LanguageKey = keyof typeof LANGUAGE;
