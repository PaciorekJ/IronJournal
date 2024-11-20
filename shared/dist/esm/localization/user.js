import { localizeEnumField } from './utils.js';

function localizeUserConstants(user, language) {
    const localizedUser = { ...user };
    // Localize 'languagePreference' field
    localizedUser.languagePreference = localizeEnumField("LANGUAGE", user.languagePreference, language);
    return localizedUser;
}

export { localizeUserConstants };
//# sourceMappingURL=user.js.map
