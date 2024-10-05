import CONSTANT_LOCALIZATIONS from "~/localization/constant-localization";

export interface LocalizedLabel {
    key: string; // Language neutral key (The value to be stored in the database)
    label: string; // contains the localized label
}

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
