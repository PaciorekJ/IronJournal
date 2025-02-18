import { LANGUAGE } from "@paciorekj/iron-journal-shared";
import { CensorSensor, CensorTier } from "censor-sensor";
import redisClient from "./redis";

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

/**
 * Checks a given string for profanity in all supported locales.
 * If profanity is found, it will be censored according to the
 * custom clean function.
 *
 * @param text The string to check for profanity
 * @param key The key to use for caching the result
 * @returns The censored string
 */
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

/**
 * Deletes the cached censored text for the given key.
 * @param key The key to delete the cached text for.
 */
export const deleteCachedCensoredText = async (key: string) => {
    await redisClient.del(`${KEY_PREFIX}:${key}`);
};

/**
 * Deletes multiple cached censored text items from Redis in a single operation.
 *
 * @param keys The keys to delete the cached text for.
 */
export const batchDeleteCachedCensoredText = async (keys: string[]) => {
    if (keys.length === 0) return;

    const fullKeys = keys.map((key) => `${KEY_PREFIX}:${key}`);
    const pipeline = redisClient.multi();

    fullKeys.forEach((fullKey) => pipeline.del(fullKey));

    await pipeline.exec();
};
