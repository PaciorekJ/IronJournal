import mongoose, { Schema } from 'mongoose';
import { LANGUAGE } from '../constants/language.js';

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    firebaseId: { type: String, required: true, unique: true, trim: true },
    languagePreference: {
        type: String,
        enum: Object.keys(LANGUAGE),
        required: true,
    },
}, { timestamps: true });
const User = mongoose.model("User", UserSchema);

export { User };
//# sourceMappingURL=user.js.map
