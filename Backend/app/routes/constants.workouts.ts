import {
    getLocalizedConstants,
    INTENSITY_LEVEL,
} from "@paciorekj/iron-journal-shared";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { requirePredicate } from "~/utils/auth.server";
import { validateLanguagePreference } from "~/utils/util.server";

export const WORKOUT_CONSTANT_MAP: Record<string, string[]> = {
    INTENSITY_LEVEL: Object.keys(INTENSITY_LEVEL),
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const userLanguage = validateLanguagePreference(user.languagePreference);

    const data = getLocalizedConstants(WORKOUT_CONSTANT_MAP, userLanguage);

    return json({ data });
};
