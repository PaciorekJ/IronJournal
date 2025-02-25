import mongoose, { Document, Schema } from "mongoose";

export interface IBodyMeasurement {
    neck?: number;
    bicepLeft?: number;
    bicepRight?: number;
    forearmLeft?: number;
    forearmRight?: number;
    chest?: number;
    stomach?: number;
    waist?: number;
    thighLeft?: number;
    thighRight?: number;
    calfLeft?: number;
    calfRight?: number;
}

export interface ISubjectiveMood {
    mentalState?: number; // 1 (Very Poor) to 10 (Excellent)
    muscleSoreness?: number; // 1 (No Soreness) to 10 (Very Sore)
    energyLevel?: number; // 1 (Very Low) to 10 (Very High)
}

export interface IDailyData extends Document {
    userId: mongoose.Types.ObjectId;
    subjectiveMood?: ISubjectiveMood;
    waterIntake?: number;
    bodyWeight?: number;
    bodyFatPercentage?: number;
    bodyMeasurements?: IBodyMeasurement;
    createdAt: Date; // Start of the day for the user's timezone
}

const BodyMeasurementSchema = new Schema<IBodyMeasurement>({
    neck: { type: Number },
    bicepLeft: { type: Number },
    bicepRight: { type: Number },
    forearmLeft: { type: Number },
    forearmRight: { type: Number },
    chest: { type: Number },
    stomach: { type: Number },
    waist: { type: Number },
    thighLeft: { type: Number },
    thighRight: { type: Number },
    calfLeft: { type: Number },
    calfRight: { type: Number },
});

const SubjectiveMoodSchema = new Schema<ISubjectiveMood>({
    mentalState: { type: Number, min: 1, max: 10 },
    muscleSoreness: { type: Number, min: 1, max: 10 },
    energyLevel: { type: Number, min: 1, max: 10 },
});

const DailyDataSchema = new Schema<IDailyData>({
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    subjectiveMood: { type: SubjectiveMoodSchema },
    waterIntake: { type: Number },
    bodyWeight: { type: Number },
    bodyFatPercentage: { type: Number },
    bodyMeasurements: { type: BodyMeasurementSchema },
    createdAt: {
        type: Date,
        required: true,
    },
});

// Ensure one entry per user per day
DailyDataSchema.index({ userId: 1, createdAt: 1 }, { unique: true });

export const DailyData = mongoose.model<IDailyData>(
    "DailyData",
    DailyDataSchema,
);
