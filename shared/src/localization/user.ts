import { LanguageKey } from "../constants/language";
import { IUser } from "../models/user";
import { localizeEnumField } from "./utils";

export interface ILocalizedUser
    extends Omit<IUser, "role" | "languagePreference"> {
    role: string;
    languagePreference: string;
}

export function localizeUserConstants(
    user: IUser,
    language: LanguageKey,
): ILocalizedUser {
    const localizedUser = { ...user } as any;

    // Localize 'languagePreference' field
    localizedUser.languagePreference = localizeEnumField(
        "LANGUAGE",
        user.languagePreference,
        language,
    );

    return localizedUser as ILocalizedUser;
}
