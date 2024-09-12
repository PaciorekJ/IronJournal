import mongoose, { Document, Schema } from 'mongoose';
import { INTENSITY_LEVEL, IntensityLevelValue } from '~/constants/intensity-levels';

// Prototype Workout Interface
interface IWorkoutPrototype extends Document {
  name: string;
  warmup?: mongoose.Schema.Types.ObjectId;
  coolDown?: mongoose.Schema.Types.ObjectId;
  sets: mongoose.Schema.Types.ObjectId[];
  userId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  description?: string;
  duration?: number;
  intensityLevel?: IntensityLevelValue;
  notes?: string;
}

// Prototype Workout Schema
const WorkoutPrototypeSchema: Schema<IWorkoutPrototype> = new Schema({
  name: { type: String, required: true },
  warmup: { type: mongoose.Schema.Types.ObjectId, ref: 'SetPrototype' },
  sets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SetPrototype', required: true }],
  coolDown: { type: mongoose.Schema.Types.ObjectId, ref: 'SetPrototype' },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duration: { type: Number },
  intensityLevel: { type: String, enum: Object.values(INTENSITY_LEVEL) },
  createdAt: { type: Date, default: Date.now },
  notes: { type: String },
});

WorkoutPrototypeSchema.index({ userId: 1 });

const WorkoutPrototype = mongoose.model<IWorkoutPrototype>('WorkoutPrototype', WorkoutPrototypeSchema);

export { WorkoutPrototype };
export type { IWorkoutPrototype };

