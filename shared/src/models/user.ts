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
    createdAt: Date;
    updatedAt: Date;

    level: number;
    xp: number;
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
        timezone: { type: String, required: true },
        measurementSystemPreference: {
            type: String,
            enum: ["METRIC", "IMPERIAL"],
            required: true,
        },
        acceptedProfanityTiers: {
            type: [Number],
            required: true,
        },
        level: { type: Number, required: true, default: 1 },
        xp: { type: Number, required: true, default: 0 },
    },
    { timestamps: true },
);

const User = mongoose.model<IUser>("User", UserSchema);

export { User };
export type { IUser };
