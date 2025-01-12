import mongoose, { Document, Schema } from "mongoose";

// Define the Mongoose interface
export interface IOneRepMaxData extends Document {
    userId: mongoose.Types.ObjectId;
    exercise: mongoose.Types.ObjectId;
    weight: number;
    updatedAt: Date;
}

// Create the schema
const OneRepMaxDataSchema = new Schema<IOneRepMaxData>({
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
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

// Create the Mongoose model
const OneRepMaxData = mongoose.model<IOneRepMaxData>(
    "OneRepMaxData",
    OneRepMaxDataSchema,
);

export default OneRepMaxData;
