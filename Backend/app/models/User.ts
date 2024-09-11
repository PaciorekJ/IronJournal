import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true, trim: true }, 
  createdAt: { type: Date, default: Date.now }, 
  updatedAt: { type: Date, default: Date.now }, 
});

UserSchema.pre<IUser>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Create the User model using the schema
const User = mongoose.model<IUser>('User', UserSchema);

export { User };
export type { IUser };

