import { LANGUAGE } from '../constants/language.js';
import CONSTANT_LOCALIZATIONS from './constant-localization.js';

const languages = Object.keys(LANGUAGE);
/**
 * Resolve a localized field to either the original value, the translated value, or
 * an object with both original and translated values.
 *
 * If the field is an array, each element will be resolved and returned as an array.
 *
 * The function returns:
 * - The original value if the original language is not present or the field is not
 *   localized.
 * - The translated value if the translated language is present and the field is
 *   localized.
 * - An object with both original and translated values if both languages are
 *   present and the field is localized.
 *
 * @param field - The field to resolve.
 * @param originalLanguage - The language of the original text.
 * @param translatedLanguage - The language to translate to.
 */
function resolveLocalizedField(field, originalLanguage, translatedLanguage) {
    if (!field?.[originalLanguage]) {
        console.error("No original language found for field", field, originalLanguage, translatedLanguage);
    }
    return {
        original: field?.[originalLanguage],
        translated: field?.[translatedLanguage],
    };
}
/**
 * Resolve a localized enum value.
 *
 * The function will look up the given `field` and `value` in the
 * `CONSTANT_LOCALIZATIONS` object for the given `language`. If the value is
 * present, it will be returned. If not, the original value will be returned.
 *
 * @param field - The field to resolve.
 * @param value - The value to resolve.
 * @param language - The language to resolve for.
 */
const resolveLocalizedEnum = (field, value, language) => {
    return CONSTANT_LOCALIZATIONS[language][field]?.[value] || value;
};
/**
 * Validate that a localized field is valid.
 *
 * @param value - The value to validate, a Map of language keys to localized values.
 * @returns true if all the keys in the map are valid language keys, false otherwise.
 */
const validateLocalizedField = (value) => {
    const keys = Array.from(value.keys());
    const allKeysValid = keys.every((key) => languages.includes(key));
    return allKeysValid;
};
/**
 * Creates a default localized field object with the given default value.
 *
 * This function generates an object where each key is a language code from
 * the `languages` array, and each value is set to the provided `defaultValue`.
 *
 * @param defaultValue - The default value to assign to each language key. Defaults to an empty string.
 * @returns An object with language keys mapped to the given default value.
 */
const defaultLocalizedField = (defaultValue) => {
    const defaultObject = {};
    languages.forEach((lang) => {
        defaultObject[lang] = defaultValue;
    });
    return defaultObject;
};
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

export { defaultLocalizedField, getLocalizedConstants, resolveLocalizedEnum, resolveLocalizedField, validateLocalizedField };
//# sourceMappingURL=utils.js.map
