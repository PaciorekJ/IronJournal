import { LANGUAGE } from "@paciorekj/iron-journal-shared";
import { CensorSensor, CensorTier } from "censor-sensor";
import { redisClient } from "./redis";

const KEY_PREFIX = "profanity-filter";

const censor = new CensorSensor();

// Define supported locales
const locales = Object.keys(LANGUAGE);

// Define profanity for each locale s.t. locale != en
censor.addLocale("es", {
    mierda: CensorTier.CommonProfanity,
    pendejo: CensorTier.CommonProfanity,
    cabron: CensorTier.CommonProfanity,
    gilipollas: CensorTier.CommonProfanity,
    coño: CensorTier.CommonProfanity,
    cono: CensorTier.CommonProfanity,
    puto: CensorTier.CommonProfanity,
    puta: CensorTier.CommonProfanity,
});

// Custom clean function to mask profanity
censor.setCleanFunction((str) => {
    if (str.length > 3) {
        const start = str.slice(0, 1);
        const middle = str.slice(1, -1);
        const end = str.slice(-1);

        return start + "*".repeat(middle.length) + end;
    }
    return "*".repeat(str.length);
});

export const censorText = async (text: string, key: string) => {
    const value = await redisClient.get(`${KEY_PREFIX}:${key}`);

    // *** If value is cached, return it ***
    if (value) {
        return value;
    }

    // *** Check each defined Locale for profanity ***
    for (const locale of locales) {
        censor.setLocale(locale);
        text = censor.cleanProfanity(text);
    }

    // *** Cache result ***
    await redisClient.set(`${KEY_PREFIX}:${key}`, text);

    return text;
};
