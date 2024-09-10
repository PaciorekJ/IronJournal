import mongoose, { Document, Schema } from 'mongoose';
import { IExercise } from './Exercise';

// Base Prototype Set interface
interface ISetPrototype extends Document {
  exercise: IExercise['_id']; // Reference to the Exercise model
  weight: number;
  reps?: number;
  sets?: number;
  restDuration?: string;
  createdAt: Date;
}

// Base Prototype Set schema for planned sets in a program
const SetPrototypeSchema: Schema<ISetPrototype> = new Schema(
  {
    exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true }, // Reference to Exercise
    weight: { type: Number, required: true },
    reps: { type: Number },
    sets: { type: Number },
    restDuration: { type: String, default: '1:00' },
    createdAt: { type: Date, default: Date.now },
  },
  { discriminatorKey: 'prototypeSetType' }
);

const SetPrototype = mongoose.model<ISetPrototype>('SetPrototype', SetPrototypeSchema);

// Define specific prototype set types for the program template
interface ISetPrototypeDrop extends ISetPrototype {
  drops: { weight: number; reps: number }[];
}

const SetPrototypeDropSchema = SetPrototype.discriminator<ISetPrototypeDrop>(
  'SetPrototypeDrop',
  new Schema({
    drops: [
      {
        weight: { type: Number, required: true },
        reps: { type: Number, required: true },
      },
    ],
  })
);

interface ISetPrototypeSuperset extends ISetPrototype {
  exercises: {
    exercise: IExercise['_id']; // Reference to Exercise model for each exercise in the superset
    reps: number;
    weight?: number;
    restDuration?: string;
  }[];
}

const SetPrototypeSupersetSchema = SetPrototype.discriminator<ISetPrototypeSuperset>(
  'SetPrototypeSuperset',
  new Schema({
    exercises: [
      {
        exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true }, // Reference to Exercise
        reps: { type: Number, required: true },
        weight: { type: Number },
        restDuration: { type: String, default: '0:30' },
      },
    ],
  })
);

export { SetPrototype, SetPrototypeDropSchema, SetPrototypeSupersetSchema };
export type { ISetPrototype, ISetPrototypeDrop, ISetPrototypeSuperset };

