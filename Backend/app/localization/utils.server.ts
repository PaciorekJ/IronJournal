import { LANGUAGE, LanguageKey } from "~/constants/language";
import CONSTANT_LOCALIZATIONS from "~/localization/constant-localization";

export interface LocalizedConstant {
    key: string;
    label: string;
}

export type localizedField<T> = {
    [key in LanguageKey]: T;
};

const languages = Object.keys(LANGUAGE);

// Ensure the constant map is a record of string keys with string array values
export const getLocalizedConstants = (
    constantMap: Record<string, string[]>,
    userLanguage: string,
): Record<string, LocalizedConstant[]> => {
    const translations = CONSTANT_LOCALIZATIONS[userLanguage]; // Get translations for the user's language

    const localizedConstants: Record<string, LocalizedConstant[]> = {};

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

export function getLocalizedField(
    field: { [key: string]: string },
    language: LanguageKey,
): string {
    return field?.[language] || field?.["en"] || "";
}

export const localizeEnumField = (
    field: string,
    value: string,
    language: LanguageKey,
) => {
    return (
        CONSTANT_LOCALIZATIONS[language][field]?.[value] ||
        CONSTANT_LOCALIZATIONS["en"][field]?.[value] ||
        value
    );
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

export const localizeDataInput = <T extends Record<string, any>>(
    data: T,
    sourceLanguage: LanguageKey,
    fieldsToLocalize: Array<keyof T>,
) => {
    const fields = fieldsToLocalize
        .map((field) => ({ key: field, value: data[field] }))
        .filter((field) => field.value);

    const localizedFields = fields.reduce(
        (acc, field) => {
            acc[field.key as keyof T] = {
                [sourceLanguage]: field.value as string,
            } as Record<LanguageKey, string>;
            return acc;
        },
        {} as Partial<Record<keyof T, localizedField<string>>>,
    );

    return {
        data: { ...data, ...localizedFields },
        queueTranslationTask: (entryId: string) => {
            console.log("Queueing translation task for entry", entryId);
            const targetLanguages = Object.keys(LANGUAGE).filter(
                (language) => language !== sourceLanguage,
            );
            console.log("Target languages", targetLanguages);
            /**
             * TODO: Have workers on RabbitMQ to translate the rest of the languages
             * using the `targetLanguages` variable.
             */
        },
    };
};
