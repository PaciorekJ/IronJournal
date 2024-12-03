import { LANGUAGE } from "@paciorekj/iron-journal-shared";
import { LoaderFunctionArgs } from "@remix-run/node";

export const languageArray = Object.entries(LANGUAGE).map(([key, value]) => ({
    key: key,
    label: value,
}));

const timeZones = Intl.supportedValuesOf("timeZone");

export const loader = async ({ request }: LoaderFunctionArgs) => {
    return {
        data: {
            LANGUAGE: languageArray,
            TIMEZONES: timeZones,
        },
    };
};
