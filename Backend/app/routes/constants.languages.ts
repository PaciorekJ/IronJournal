import { LANGUAGE } from "@paciorekj/iron-journal-shared";
import { json, LoaderFunctionArgs } from "@remix-run/node";

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
