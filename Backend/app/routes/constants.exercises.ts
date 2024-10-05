import { json, LoaderFunctionArgs } from "@remix-run/node";
import { CATEGORY } from "~/constants/category";
import { EQUIPMENT } from "~/constants/equipment";
import { FORCE } from "~/constants/force";
import { LEVEL } from "~/constants/level";
import { MECHANIC } from "~/constants/mechanic";
import { MUSCLE_GROUP } from "~/constants/muscle-group";
import { requirePredicate } from "~/utils/auth.server";
import { getLocalizedConstants } from "~/utils/localization.server";
import { validateLanguagePreference } from "~/utils/util.server";

export const EXERCISE_CONSTANT_MAP: Record<string, string[]> = {
    EQUIPMENT: Object.keys(EQUIPMENT),
    FORCE: Object.keys(FORCE),
    LEVEL: Object.keys(LEVEL),
    MECHANIC: Object.keys(MECHANIC),
    CATEGORY: Object.keys(CATEGORY),
    MUSCLE_GROUP: Object.keys(MUSCLE_GROUP),
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const userLanguage = validateLanguagePreference(user.languagePreference);

    const data = getLocalizedConstants(EXERCISE_CONSTANT_MAP, userLanguage);

    return json({ data });
};
