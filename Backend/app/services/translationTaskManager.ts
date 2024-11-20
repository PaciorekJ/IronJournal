import {
    getRabbitMQChannel,
    LanguageKey,
    TranslationTask,
} from "@paciorekj/iron-journal-shared";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const TASK_QUEUE = "translation_tasks";

export async function addTranslationTask(
    documentType: DocumentType,
    documentId: mongoose.Schema.Types.ObjectId,
    fieldsToTranslate: string[],
    sourceLanguage: LanguageKey,
    targetLanguages: LanguageKey[],
): Promise<string> {
    const channel = await getRabbitMQChannel();

    const taskId = uuidv4();

    const message = {
        taskId,
        documentType,
        documentId,
        fieldsToTranslate,
        sourceLanguage,
        targetLanguages,
    };

    await TranslationTask.create({
        taskId,
        documentType,
        documentId,
        fieldsToTranslate,
        sourceLanguage,
        targetLanguages,
        status: "PENDING",
    });

    await channel.assertQueue(TASK_QUEUE, { durable: true });

    channel.sendToQueue(TASK_QUEUE, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    });

    console.log(`Queued translation task ${taskId} for document ${documentId}`);
    return taskId;
}

export async function cancelTranslationTask(taskId: string) {
    await TranslationTask.findOneAndUpdate(
        { taskId },
        { $set: { status: "CANCELED" } },
    );
}

export async function isTaskCanceled(taskId: string): Promise<boolean> {
    const task = await TranslationTask.findOne({ taskId });
    return task?.status === "CANCELED";
}
