import { Document, Schema, model } from "mongoose";
import { localizedField, validateLocalizedField } from "../localization";

export interface IAnnouncement extends Document {
    title: localizedField<string>;
    description: localizedField<string>;
    createdAt?: Date;
}

const AnnouncementSchema: Schema<IAnnouncement> = new Schema(
    {
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
        description: {
            type: Map,
            of: String,
            required: true,
            trim: true,
            validate: {
                validator: validateLocalizedField,
                message: 'Invalid language key in "message" field.',
            },
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
);

const Announcement = model<IAnnouncement>("Announcement", AnnouncementSchema);
export default Announcement;
