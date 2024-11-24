import { resolveLocalizedEnum } from './utils.js';

/**
 * Resolve a localized user object.
 *
 * The function will look up the given `user` fields in the
 * `CONSTANT_LOCALIZATIONS` object for the given `language`. If the value is
 * present, it will be returned. If not, the original value will be returned.
 *
 * @param user - The user to resolve.
 * @param language - The language to resolve for.
 * @returns The localized user object.
 */
function resolveLocalizedUser(user, language) {
    const localizedUser = { ...user };
    // Localize 'languagePreference' field
    localizedUser.languagePreference = resolveLocalizedEnum("LANGUAGE", user.languagePreference, language);
    return localizedUser;
}

export { resolveLocalizedUser };
//# sourceMappingURL=user.js.map
