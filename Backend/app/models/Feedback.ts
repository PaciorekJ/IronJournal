import mongoose, { Document, Schema, model } from "mongoose";

export interface IFeedback extends Document {
    user?: mongoose.Types.ObjectId;
    subject: string;
    message: string;
    rating?: number;
    createdAt?: Date;
}

const FeedbackSchema: Schema<IFeedback> = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
);

const Feedback = model<IFeedback>("Feedback", FeedbackSchema);
export default Feedback;
