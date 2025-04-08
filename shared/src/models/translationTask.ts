import mongoose, { Document, Schema } from "mongoose";
import { LanguageKey } from "../constants/language";

export type DocumentType =
    | "PROGRAM"
    | "EXERCISE"
    | "WORKOUT-PROTOTYPE"
    | "ANNOUNCEMENT"
    | "NOTIFICATION";

interface ITranslationTask extends Document {
    taskId: string;
    documentType: DocumentType;
    documentId: mongoose.Schema.Types.ObjectId;
    fieldsToTranslate: string[];
    sourceLanguage: LanguageKey;
    targetLanguages: LanguageKey[];
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "FAILED";
    createdAt: Date;
    updatedAt: Date;
    error?: string;
}

const TranslationTaskSchema: Schema<ITranslationTask> = new Schema(
    {
        taskId: { type: String, required: true, unique: true },
        documentType: { type: String, required: true },
        documentId: { type: mongoose.Schema.Types.ObjectId, required: true },
        fieldsToTranslate: [{ type: String, required: true }],
        sourceLanguage: { type: String, required: true },
        targetLanguages: [{ type: String, required: true }],
        status: {
            type: String,
            enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELED", "FAILED"],
            default: "PENDING",
            required: true,
        },
        error: { type: String },
    },
    { timestamps: true },
);

TranslationTaskSchema.index({ status: 1, createdAt: 1 });

const TranslationTask = mongoose.model<ITranslationTask>(
    "TranslationTask",
    TranslationTaskSchema,
);

export { TranslationTask };
export type { ITranslationTask };
