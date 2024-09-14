import mongoose, { Document, Schema } from 'mongoose';
import { ROLE, RoleTypeValue } from '~/constants/role';

interface IUser extends Document {
  username: string;
  role: RoleTypeValue;
  firebaseId: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true, trim: true }, 
  role: { type: String, enum: Object.values(ROLE), default: ROLE.USER },
  firebaseId: { type: String, required: true, unique: true, trim: true },
  createdAt: { type: Date, default: Date.now }, 
  updatedAt: { type: Date, default: Date.now }, 
});

UserSchema.pre<IUser>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.model<IUser>('User', UserSchema);

export { User };
export type { IUser };

