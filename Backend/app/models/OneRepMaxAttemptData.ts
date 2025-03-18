import mongoose, { Document, Schema } from "mongoose";

export interface IOneRepMaxAttemptData extends Document {
    userId: mongoose.Types.ObjectId;
    exercise: mongoose.Types.ObjectId;
    weight: number;
    notes?: string;
    createdAt: Date;
}

const OneRepMaxAttemptDataSchema = new Schema<IOneRepMaxAttemptData>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        exercise: {
            type: Schema.Types.ObjectId,
            ref: "Exercise",
            required: true,
        },
        weight: {
            type: Number,
            required: true,
            min: 0,
        },
        notes: {
            type: String,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
);

// Create the Mongoose model
const OneRepMaxAttemptData = mongoose.model<IOneRepMaxAttemptData>(
    "OneRepMaxAttemptData",
    OneRepMaxAttemptDataSchema,
);

export default OneRepMaxAttemptData;
