import { SET_TYPE, SetTypeKey } from "@paciorekj/iron-journal-shared";
import mongoose, { Document, model, Schema } from "mongoose";

export interface ISetDataEntry {
    reps: number;
    weight: number; // Non-negative, normalized to KG
    rpe?: number; // 1-10 scale
    restDurationInSeconds?: number;
    distanceInCentimeters?: number;
    durationInSeconds?: number;
}

export interface ISetData extends Document {
    userId: mongoose.Types.ObjectId;
    type: SetTypeKey;
    tempo?: {
        eccentric: number;
        bottomPause: number;
        concentric: number;
        topPause: number;
    };
    weight: number;
    initialWeightSelection: number;
    exercise: mongoose.Types.ObjectId;
    setData: ISetDataEntry[];
}

// Subdocument Schema for ISetDataEntry
const SetDataEntrySchema = new Schema<ISetDataEntry>({
    reps: {
        type: Number,
        min: 0,
    },
    weight: {
        type: Number,
        min: 0,
    },
    rpe: {
        type: Number,
        min: 1,
        max: 10,
    },
    restDurationInSeconds: {
        type: Number,
        min: 0,
    },
    distanceInCentimeters: {
        type: Number,
        min: 0,
    },
    durationInSeconds: {
        type: Number,
        min: 0,
    },
});

// Main Schema for ISetData
const mongooseSetDataSchema = new Schema<ISetData>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: Object.keys(SET_TYPE),
        required: true,
    },
    tempo: {
        eccentric: { type: Number, min: 0 },
        bottomPause: { type: Number, min: 0 },
        concentric: { type: Number, min: 0 },
        topPause: { type: Number, min: 0 },
    },
    weight: {
        type: Number,
        min: 0,
    },
    exercise: {
        type: Schema.Types.ObjectId,
        ref: "Exercise",
    },
    setData: {
        type: [SetDataEntrySchema],
        required: true,
    },
});

const SetData = model<ISetData>("SetData", mongooseSetDataSchema);

export default SetData;
