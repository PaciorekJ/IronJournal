import mongoose, { Document, Schema, model } from "mongoose";

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: "info" | "warning";
    read: boolean;
    createdAt?: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: ["info", "warning"],
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
);

NotificationSchema.index({ userId: 1 });

const NotificationModel = model<INotification>(
    "Notification",
    NotificationSchema,
);
export default NotificationModel;
