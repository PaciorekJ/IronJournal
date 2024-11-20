import {
    LANGUAGE,
    LanguageKey,
} from "@paciorekj/iron-journal-shared/constants";
import { localizedField } from "@paciorekj/iron-journal-shared/localization";
import mongoose from "mongoose";
import { addTranslationTask } from "~/services/translationTaskManager";

export const localizeDataInput = <T extends Record<string, any>>(
    data: T,
    sourceLanguage: LanguageKey,
    fieldsToLocalize: Array<keyof T>,
    documentType: DocumentType,
) => {
    const fields = fieldsToLocalize
        .map((field) => ({ key: field, value: data[field] }))
        .filter((field) => field.value);

    const localizedFields = fields.reduce(
        (acc, field) => {
            acc[field.key as keyof T] = {
                [sourceLanguage]: field.value as string,
            } as localizedField<string>;
            return acc;
        },
        {} as Partial<Record<keyof T, localizedField<string>>>,
    );

    return {
        data: { ...data, ...localizedFields },
        queueTranslationTask: async (
            entryId: mongoose.Schema.Types.ObjectId,
        ) => {
            console.log("Queueing translation task for entry", entryId);
            const targetLanguages = Object.keys(LANGUAGE).filter(
                (language) => language !== sourceLanguage,
            ) as LanguageKey[];

            const fieldsToTranslate = fieldsToLocalize as string[];

            const taskId = await addTranslationTask(
                documentType,
                entryId,
                fieldsToTranslate,
                sourceLanguage,
                targetLanguages,
            );

            return taskId;
        },
    };
};
