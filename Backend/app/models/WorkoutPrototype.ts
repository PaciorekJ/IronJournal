import mongoose, { Document, Schema } from 'mongoose';

// Prototype Workout Interface
interface IWorkoutPrototype extends Document {
  name: string;
  warmup: mongoose.Schema.Types.ObjectId;
  coolDown: mongoose.Schema.Types.ObjectId;
  sets: mongoose.Schema.Types.ObjectId[];
  userId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  description?: string;
  notes?: string;
}

// Prototype Workout Schema
const WorkoutPrototypeSchema: Schema<IWorkoutPrototype> = new Schema({
  name: { type: String, required: true },
  warmup: { type: mongoose.Schema.Types.ObjectId, ref: 'SetPrototype', required: true },
  sets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SetPrototype', required: true }],
  coolDown: { type: mongoose.Schema.Types.ObjectId, ref: 'SetPrototype', required: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  notes: { type: String },
});

WorkoutPrototypeSchema.index({ userId: 1 });

const WorkoutPrototype = mongoose.model<IWorkoutPrototype>('WorkoutPrototype', WorkoutPrototypeSchema);

export { WorkoutPrototype };
export type { IWorkoutPrototype };

