import {
    DAYS_OF_WEEK,
    FOCUS_AREA,
    getLocalizedConstants,
    SCHEDULE_TYPE,
    TARGET_AUDIENCE,
} from "@paciorekj/iron-journal-shared";
import { LoaderFunctionArgs } from "@remix-run/node";
import { requirePredicate } from "~/utils/auth.server";
import { validateLanguagePreference } from "~/utils/util.server";

export const PROGRAM_CONSTANT_MAP: Record<string, string[]> = {
    FOCUS_AREA: Object.keys(FOCUS_AREA),
    SCHEDULE_TYPE: Object.keys(SCHEDULE_TYPE),
    TARGET_AUDIENCE: Object.keys(TARGET_AUDIENCE),
    DAYS_OF_WEEK: Object.keys(DAYS_OF_WEEK),
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const userLanguage = validateLanguagePreference(user.languagePreference);

    const data = getLocalizedConstants(PROGRAM_CONSTANT_MAP, userLanguage);

    return { data };
};
