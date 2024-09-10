import mongoose, { Document, Schema } from 'mongoose';

interface IExercise extends Document {
    name: string;
    force: string;
    level: string;
    mechanic: string | null;
    equipment: string | null;
    primaryMuscles: string[];
    secondaryMuscles: string[];
    instructions: string[];
    category: string;
    images: string[];
    id: string;
}

// Define the Exercise schema
const ExerciseSchema: Schema<IExercise> = new Schema({
  name: { type: String, required: true },
  level: { type: String, required: true },
  primaryMuscles: { type: [String], required: true },
  instructions: { type: [String], required: true },
  category: { type: String, required: true },
  images: { type: [String], required: true },
  id: { type: String, required: true, unique: true },
  force: { type: String, default: null },
  mechanic: { type: String, default: null },
  equipment: { type: String, default: null },
  secondaryMuscles: { type: [String], default: [] },
});

ExerciseSchema.pre<IExercise>('save', function (next) {
    this.images = this.images.map((image) => `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${image}`);
    next();
});

const Exercise = mongoose.model<IExercise>('Exercise', ExerciseSchema);

export { Exercise };
export type { IExercise };

