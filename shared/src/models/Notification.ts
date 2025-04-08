import mongoose, { Document, Schema, model } from "mongoose";
import { localizedField, validateLocalizedField } from "../localization";

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    title: localizedField<string>;
    message: localizedField<string>;
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
            type: Map,
            of: String,
            required: true,
            trim: true,
            validate: {
                validator: validateLocalizedField,
                message: 'Invalid language key in "title" field.',
            },
        },
        message: {
            type: Map,
            of: String,
            required: true,
            trim: true,
            validate: {
                validator: validateLocalizedField,
                message: 'Invalid language key in "message" field.',
            },
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
