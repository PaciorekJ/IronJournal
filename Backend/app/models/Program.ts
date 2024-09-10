import mongoose, { Document, Schema } from 'mongoose';

// Program interface
interface IProgram extends Document {
  name: string;
  description?: string;
  workouts: mongoose.Schema.Types.ObjectId[];
  userId: mongoose.Schema.Types.ObjectId;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  isPublic?: boolean;
}

// Program schema
const ProgramSchema: Schema<IProgram> = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  workouts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout' }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duration: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  notes: { type: String },
  isPublic: { type: Boolean, default: false },
});

// Middleware to update 'updatedAt' field
ProgramSchema.pre<IProgram>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Program = mongoose.model<IProgram>('Program', ProgramSchema);

export { Program };
export type { IProgram };
