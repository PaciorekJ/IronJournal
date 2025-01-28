import { LANGUAGE } from "@paciorekj/iron-journal-shared";

export const languageArray = Object.entries(LANGUAGE).map(([key, value]) => ({
    key: key,
    label: value,
}));

const timeZones = Intl.supportedValuesOf("timeZone");

export const loader = async () => {
    return {
        data: {
            LANGUAGE: languageArray,
            TIMEZONES: timeZones,
        },
    };
};
