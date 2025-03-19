import mongoose, { Document, Schema } from "mongoose";
import { LANGUAGE, LanguageKey } from "../constants/language";

interface IUser extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    username: string;
    firebaseId: string;
    languagePreference: LanguageKey;
    measurementSystemPreference: "METRIC" | "IMPERIAL";
    acceptedProfanityTiers: (1 | 2 | 3 | 4 | 5)[];
    timezone: string;

    activeProgram: mongoose.Schema.Types.ObjectId;
    favoritePrograms: mongoose.Schema.Types.ObjectId[];
    favoriteWorkouts: mongoose.Schema.Types.ObjectId[];

    xp: number;
    level: number;
    streak: {
        count: number;
        lastUpdated: Date;
    };

    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        firebaseId: { type: String, required: true, unique: true, trim: true },
        languagePreference: {
            type: String,
            enum: Object.keys(LANGUAGE),
            required: true,
        },
        activeProgram: { type: Schema.Types.ObjectId, required: true },
        timezone: { type: String, required: true },
        measurementSystemPreference: {
            type: String,
            enum: ["METRIC", "IMPERIAL"],
            required: true,
        },
        favoritePrograms: [
            {
                type: Schema.Types.ObjectId,
                default: [],
                validate: [
                    (val) => val.length <= 100,
                    "Cannot have more than 100 favorite programs.",
                ],
            },
        ],
        favoriteWorkouts: [
            {
                type: Schema.Types.ObjectId,
                default: [],
                validate: [
                    (val) => val.length <= 100,
                    "Cannot have more than 100 favorite programs.",
                ],
            },
        ],
        acceptedProfanityTiers: {
            type: [Number],
            required: true,
        },
        xp: { type: Number, required: true, default: 0 },
        level: { type: Number, required: true, default: 1 },
        streak: {
            count: { type: Number, required: true, default: 0 },
            lastUpdated: { type: Date, required: true, default: Date.now },
        },
    },
    { timestamps: true },
);

const User = mongoose.model<IUser>("User", UserSchema);

export { User };
export type { IUser };
