import { json, LoaderFunctionArgs } from "@remix-run/node";
import { LANGUAGE } from "~/constants/language";
import { isLoginValid } from "~/utils/auth.server";

export const languageArray = Object.entries(LANGUAGE).map(([key, value]) => ({
    key: key,
    label: value,
}));

export const loader = async ({ request }: LoaderFunctionArgs) => {
    return json({
        data: {
            LANGUAGE: languageArray,
        },
    });
};
