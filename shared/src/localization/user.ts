import { LanguageKey } from "../constants/language";
import { IUser } from "../models/user";
import { resolveLocalizedEnum } from "./utils";

export interface ILocalizedUser
    extends Omit<IUser, "role" | "languagePreference"> {
    role: string;
    languagePreference: string;
}

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
export function resolveLocalizedUser(
    user: IUser,
    language: LanguageKey,
): ILocalizedUser {
    const localizedUser = { ...user } as any;

    // Localize 'languagePreference' field
    localizedUser.languagePreference = resolveLocalizedEnum(
        "LANGUAGE",
        user.languagePreference,
        language,
    );

    return localizedUser as ILocalizedUser;
}
