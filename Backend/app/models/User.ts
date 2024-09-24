import mongoose, { Document, Schema } from "mongoose";
import { LANGUAGE, LanguageValue } from "~/constants/language";
import { ROLE, RoleTypeValue } from "~/constants/role";
import { Timestamps } from "~/interfaces/timestamp";

interface IUser extends Document, Timestamps {
    _id: mongoose.Schema.Types.ObjectId;
    username: string;
    firebaseId: string;

    language?: LanguageValue;

    role: RoleTypeValue;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        firebaseId: { type: String, required: true, unique: true, trim: true },
        role: { type: String, enum: Object.values(ROLE), default: ROLE.USER },
        language: { type: String, enum: Object.values(LANGUAGE) },
    },
    { timestamps: true },
);

const User = mongoose.model<IUser>("User", UserSchema);

export { User };
export type { IUser };
