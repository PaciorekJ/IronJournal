import mongoose, { Document, Schema } from "mongoose";
import { LANGUAGE, LanguageKey } from "../constants/language";

interface IUser extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    username: string;
    firebaseId: string;
    languagePreference: LanguageKey;
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
    },
    { timestamps: true },
);

const User = mongoose.model<IUser>("User", UserSchema);

export { User };
export type { IUser };
