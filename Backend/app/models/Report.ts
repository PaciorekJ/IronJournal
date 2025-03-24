import mongoose, { Document, Schema, model } from "mongoose";

interface IReport extends Document {
    type: "Program" | "Workout" | "User";
    reporter: mongoose.Types.ObjectId;
    reported: mongoose.Types.ObjectId;
    reason: string;
    details?: string;
    status: "pending" | "reviewed" | "closed";
    createdAt?: Date;
    updatedAt?: Date;
}

const ReportSchema: Schema<IReport> = new Schema(
    {
        reporter: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        reported: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: "type",
        },
        type: {
            type: String,
            required: true,
            enum: ["Program", "Workout", "User"],
        },
        reason: {
            type: String,
            required: true,
        },
        details: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "closed"],
            default: "pending",
        },
    },
    { timestamps: true },
);

const ReportModel = model<IReport>("Report", ReportSchema);

export default ReportModel;

export type { IReport };
