import { LANGUAGE } from '../constants/language.js';
import CONSTANT_LOCALIZATIONS from './constant-localization.js';

const languages = Object.keys(LANGUAGE);
// Ensure the constant map is a record of string keys with string array values
const getLocalizedConstants = (constantMap, userLanguage) => {
    const translations = CONSTANT_LOCALIZATIONS[userLanguage]; // Get translations for the user's language
    const localizedConstants = {};
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
function getLocalizedField(field, language) {
    return field?.[language] || field?.["en"] || "";
}
const localizeEnumField = (field, value, language) => {
    return (CONSTANT_LOCALIZATIONS[language][field]?.[value] ||
        CONSTANT_LOCALIZATIONS["en"][field]?.[value] ||
        value);
};
const validateLocalizedField = (value) => {
    const keys = Array.from(value.keys());
    // Check if all keys are valid language keys
    const allKeysValid = keys.every((key) => languages.includes(key));
    // Return false if any key is invalid (this will cause Mongoose to trigger a validation error)
    return allKeysValid;
};
const defaultLocalizedField = (defaultValue = "") => {
    const defaultObject = {};
    languages.forEach((lang) => {
        defaultObject[lang] = defaultValue;
    });
    return defaultObject;
};

export { defaultLocalizedField, getLocalizedConstants, getLocalizedField, localizeEnumField, validateLocalizedField };
//# sourceMappingURL=utils.js.map
