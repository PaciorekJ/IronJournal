import { LANGUAGE, LanguageKey } from "~/constants/language";
import CONSTANT_LOCALIZATIONS from "~/localization/constant-localization";

export interface LocalizedLabel {
    key: string; // Language neutral key (The value to be stored in the database)
    label: string; // contains the localized label
}

export type localizedField<T> = {
    [key in LanguageKey]: T;
};

const languages = Object.keys(LANGUAGE);

// Ensure the constant map is a record of string keys with string array values
export const getLocalizedConstants = (
    constantMap: Record<string, string[]>,
    userLanguage: string,
): Record<string, LocalizedLabel[]> => {
    const translations = CONSTANT_LOCALIZATIONS[userLanguage]; // Get translations for the user's language

    const localizedConstants: Record<string, LocalizedLabel[]> = {};

    // Iterate over each group in the constantMap
    Object.keys(constantMap).forEach((group) => {
        localizedConstants[group] = constantMap[group].map((key) => {
            const label = translations?.[group]?.[key] || key;

            return {
                key,
                label,
            };
        });
    });

    return localizedConstants;
};

export const validateLocalizedField = (value: Map<string, string>) => {
    const keys = Array.from(value.keys());

    // Check if all keys are valid language keys
    const allKeysValid = keys.every((key) => languages.includes(key));

    // Return false if any key is invalid (this will cause Mongoose to trigger a validation error)
    return allKeysValid;
};

export const defaultLocalizedField = (defaultValue = "") => {
    const defaultObject: Record<string, string> = {};

    languages.forEach((lang) => {
        defaultObject[lang] = defaultValue;
    });

    return defaultObject;
};
