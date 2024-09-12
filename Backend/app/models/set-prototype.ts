import mongoose, { Document, Schema } from 'mongoose';
import { SET_TYPES, SetTypeValue } from '~/constants/set-types';
import { WEIGHT_SELECTION_METHOD, WeightSelectionMethodValue } from '~/constants/weight-selection';
import { IExercise } from './exercise';


export type NumberOrRange = number | [number, number];

interface ISetPrototype extends Document {
  exercise: IExercise['_id'];
  alternatives?: IExercise['_id'][];
  restDuration?: string;
  createdAt: Date;
  type: SetTypeValue;
}

const SetPrototypeSchema: Schema<ISetPrototype> = new Schema(
  {
    exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
    alternatives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', default: [] }],
    restDuration: { type: String, default: '1:00' },
    createdAt: { type: Date, default: Date.now },
    type: { type: String, enum: Object.values(SET_TYPES), required: true },
  },
  { discriminatorKey: 'type' }
);

const SetPrototype = mongoose.model<ISetPrototype>('SetPrototype', SetPrototypeSchema);

interface ISetPrototypeStraightSet extends ISetPrototype {
  reps: NumberOrRange;
  sets: NumberOrRange;
  weightSelection: {
    method: WeightSelectionMethodValue;
    value: number;
  };
}

const SetPrototypeStraightSetSchema = SetPrototype.discriminator<ISetPrototypeStraightSet>(
  SET_TYPES.STRAIGHT_SET,
  new Schema({
    reps: { type: Schema.Types.Mixed, required: true },
    sets: { type: Schema.Types.Mixed, required: true },
    weightSelection: {
      method: { type: String, enum: Object.values(WEIGHT_SELECTION_METHOD), required: true },
      value: { type: Number, required: true },
    },
  })
);

interface ISetPrototypeDropSet extends ISetPrototype {
  drops: {
    weightSelection: {
      method: WeightSelectionMethodValue;
      value: number;
    };
    reps: NumberOrRange;
  }[];
}

const SetPrototypeDropSetSchema = SetPrototype.discriminator<ISetPrototypeDropSet>(
  SET_TYPES.DROP_SET,
  new Schema({
    drops: [
      {
        weightSelection: {
          method: { type: String, enum: Object.values(WEIGHT_SELECTION_METHOD), required: true },
          value: { type: Number, required: true },
        },
        reps: { type: Schema.Types.Mixed, required: true },
      },
    ],
  })
);

interface ISetPrototypeSuperset extends ISetPrototype {
  exercises: {
    exercise: IExercise['_id'];
    reps: NumberOrRange;
    restDuration?: string;
    weightSelection: {
      method: WeightSelectionMethodValue;
      value: number;
    };
  }[];
}

const SetPrototypeSupersetSchema = SetPrototype.discriminator<ISetPrototypeSuperset>(
  SET_TYPES.SUPER_SET,
  new Schema({
    exercises: [
      {
        exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
        reps: { type: Schema.Types.Mixed, required: true },
        restDuration: { type: String, default: '0:30' },
        weightSelection: {
          method: { type: String, enum: Object.values(WEIGHT_SELECTION_METHOD), required: true },
          value: { type: Number, required: true },
        },
      },
    ],
  })
);

export {
  SetPrototype,
  SetPrototypeDropSetSchema,
  SetPrototypeStraightSetSchema,
  SetPrototypeSupersetSchema
};
export type { ISetPrototype, ISetPrototypeDropSet, ISetPrototypeStraightSet, ISetPrototypeSuperset };

