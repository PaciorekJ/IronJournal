import { Document, Schema, model } from "mongoose";

export interface IAnnouncement extends Document {
    title: string;
    message: string;
    createdAt?: Date;
}

const AnnouncementSchema: Schema<IAnnouncement> = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
);

const Announcement = model<IAnnouncement>("Announcement", AnnouncementSchema);
export default Announcement;
