import axios from "axios";
import { LanguageKey } from "~/constants/language";
import { localizedField } from "~/localization/utils.server";

if (!process.env.LIBRETRANSLATE_URL) {
    throw new Error("Missing environment variable: LIBRETRANSLATE_URL");
}

const libreTranslateInstance = axios.create({
    baseURL: process.env.LIBRETRANSLATE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

async function translateText(
    text: string,
    source: string,
    targets: string[],
): Promise<{ [key: string]: string }> {
    try {
        const translationPromises = targets.map(async (target) => {
            const response = await libreTranslateInstance.post("/translate", {
                q: text,
                source,
                target,
            });
            return { [target]: response.data.translatedText };
        });

        const translationsArray = await Promise.all(translationPromises);

        return translationsArray.reduce((acc, translation) => {
            return { ...acc, ...translation };
        }, {});
    } catch (error) {
        console.error("Translation error:", error);
        throw new Error("Translation failed");
    }
}

export default translateText;
