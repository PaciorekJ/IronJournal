import mongoose, { Document, Schema } from 'mongoose';

// Prototype Workout Interface
interface IWorkoutPrototype extends Document {
  name: string;
  description?: string;
  sets: mongoose.Schema.Types.ObjectId[]; // Array of references to ISetPrototype
  createdAt: Date;
  userId: mongoose.Schema.Types.ObjectId; // Reference to the user who created the workout
  notes?: string;
}

// Prototype Workout Schema
const WorkoutPrototypeSchema: Schema<IWorkoutPrototype> = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  sets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SetPrototype', required: true }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  notes: { type: String },
});

const WorkoutPrototype = mongoose.model<IWorkoutPrototype>('WorkoutPrototype', WorkoutPrototypeSchema);

export { WorkoutPrototype };
export type { IWorkoutPrototype };
