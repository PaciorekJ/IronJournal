import { json, LoaderFunctionArgs } from "@remix-run/node";
import { SET_TYPE } from "~/constants/set-type";
import { WEIGHT_SELECTION_METHOD } from "~/constants/weight-selection";
import { getLocalizedConstants } from "~/localization/utils.server";
import { requirePredicate } from "~/utils/auth.server";
import { validateLanguagePreference } from "~/utils/util.server";

export const SET_CONSTANT_MAP: Record<string, string[]> = {
    SET_TYPE: Object.keys(SET_TYPE),
    WEIGHT_SELECTION_METHOD: Object.keys(WEIGHT_SELECTION_METHOD),
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const userLanguage = validateLanguagePreference(user.languagePreference);

    const data = getLocalizedConstants(SET_CONSTANT_MAP, userLanguage);

    return json({ data });
};
