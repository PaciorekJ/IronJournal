import { getLocalizedConstants } from "@paciorekj/iron-journal-shared";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { requirePredicate } from "~/utils/auth.server";
import { validateLanguagePreference } from "~/utils/util.server";
import { EXERCISE_CONSTANT_MAP } from "./constants.exercises";
import { languageArray } from "./constants.languages";
import { PROGRAM_CONSTANT_MAP } from "./constants.programs";
import { SET_CONSTANT_MAP } from "./constants.sets";
import { WORKOUT_CONSTANT_MAP } from "./constants.workouts";

export const ALL_CONSTANT_MAP: Record<string, string[]> = {
    ...EXERCISE_CONSTANT_MAP,
    ...PROGRAM_CONSTANT_MAP,
    ...SET_CONSTANT_MAP,
    ...WORKOUT_CONSTANT_MAP,
};

// Loader function to handle requests and return localized constants
export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const userLanguage = validateLanguagePreference(user.languagePreference);

    const data = getLocalizedConstants(ALL_CONSTANT_MAP, userLanguage);

    return json({
        data: {
            LANGUAGE: languageArray,
            ...data,
        },
    });
};
