import mongoose, { Schema } from 'mongoose';

const TranslationTaskSchema = new Schema({
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
}, { timestamps: true });
TranslationTaskSchema.index({ status: 1, createdAt: 1 });
const TranslationTask = mongoose.model("TranslationTask", TranslationTaskSchema);

export { TranslationTask };
//# sourceMappingURL=translationTask.js.map
