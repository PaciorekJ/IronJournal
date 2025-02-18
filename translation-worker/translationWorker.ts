import dotenv from "dotenv";
dotenv.config();

import Database from "@paciorekj/iron-journal-shared/database";
import { Exercise } from "@paciorekj/iron-journal-shared/models/exercise";
import { Program } from "@paciorekj/iron-journal-shared/models/program";
import { TranslationTask } from "@paciorekj/iron-journal-shared/models/translationTask";
import { Workout } from "@paciorekj/iron-journal-shared/models/workout";
import { getRabbitMQChannel } from "@paciorekj/iron-journal-shared/rabbitMQ";
import translateText from "./libreTranslate.js";

const TASK_QUEUE = "translation_tasks";

async function startTranslationWorker() {
    await Database.connect();

    console.log("Translation worker connected to mongoDB");

    const channel = await getRabbitMQChannel();

    await channel.assertQueue(TASK_QUEUE, { durable: true });

    channel.consume(
        TASK_QUEUE,
        async (msg: { content: { toString: () => string } } | null) => {
            console.log(`Received message: ${msg?.content.toString()}`);
            if (msg === null) {
                return;
            }

            const taskMessage = JSON.parse(msg.content.toString());

            const {
                taskId,
                documentType,
                documentId,
                fieldsToTranslate,
                sourceLanguage,
                targetLanguages,
            } = taskMessage;

            console.log(`Parsed task message: ${taskMessage}`);

            try {
                const task = await TranslationTask.findOne({ taskId });

                if (!task) {
                    console.error(`Task ${taskId} not found in database.`);
                    channel.ack(msg as any);
                    return;
                }

                if (task.status === "CANCELED") {
                    console.log(`Task ${taskId} was canceled.`);
                    channel.ack(msg as any);
                    return;
                }

                await TranslationTask.findOneAndUpdate(
                    { taskId },
                    { $set: { status: "IN_PROGRESS" } },
                );
                console.log(`Task ${taskId} started.`);

                // Fetch the document based on type
                let Model: any;
                switch (documentType as string) {
                    case "EXERCISE":
                        Model = Exercise;
                        break;
                    case "PROGRAM":
                        Model = Program;
                        break;
                    case "WORKOUT-PROTOTYPE":
                        Model = Workout;
                        break;
                    default:
                        throw new Error("Invalid document type");
                }

                const document = await Model.findById(documentId);

                console.log(`Fetching document ${documentId}`);
                console.log({ document });

                if (!document) {
                    throw new Error(`Document with ID ${documentId} not found`);
                }

                console.log(`Translating document ${documentId}`);

                const updates: any = {};

                for (const field of fieldsToTranslate) {
                    const fieldMap =
                        document[field] instanceof Map ? document[field] : null;
                    if (!fieldMap) continue;

                    const fieldValue = fieldMap.get(sourceLanguage);
                    if (!fieldValue) continue;

                    updates[field] = {
                        [sourceLanguage]: fieldValue,
                    };

                    let translations: any = {};
                    if (Array.isArray(fieldValue)) {
                        const rawTranslations = await Promise.all(
                            fieldValue.map((value) =>
                                translateText(
                                    value,
                                    sourceLanguage,
                                    targetLanguages,
                                ),
                            ),
                        );

                        translations = targetLanguages.reduce(
                            (acc: any, targetLang: string) => {
                                acc[targetLang] = rawTranslations.map(
                                    (translation) => translation[targetLang],
                                );
                                return acc;
                            },
                            {},
                        );
                    } else {
                        translations = await translateText(
                            fieldValue,
                            sourceLanguage,
                            targetLanguages,
                        );
                    }

                    for (const targetLanguage of targetLanguages) {
                        updates[field][targetLanguage] =
                            translations[targetLanguage];
                    }
                }

                console.log(`Updating document ${documentId}`);

                console.log({ updates });

                console.log(`Updating document ${documentId}`);
                const updatedDocument = await Model.findByIdAndUpdate(
                    documentId,
                    { $set: updates },
                    { new: true },
                );
                console.log({ updatedDocument });

                await TranslationTask.findOneAndUpdate(
                    { taskId },
                    { $set: { status: "COMPLETED" } },
                );

                console.log(`Successfully translated document ${documentId}`);
                channel.ack(msg as any);
            } catch (error: any) {
                console.error(
                    `Error processing translation task ${taskId}:`,
                    error,
                );

                // Update task status to FAILED
                await TranslationTask.findOneAndUpdate(
                    { taskId },
                    { $set: { status: "FAILED", error: error.message } },
                );

                channel.nack(msg as any, false, false);
            }
        },
        { noAck: false },
    );
}

startTranslationWorker()
    .then(() => console.log("Translation worker started"))
    .catch((err) => {
        console.error("Failed to start translation worker:", err);
    });
