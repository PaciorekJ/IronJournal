import mongoose, { Document, Schema } from 'mongoose';
import { DAYS_OF_WEEK, DaysOfWeekValue } from '~/constants/days-of-week';
import { FOCUS_AREAS, FocusAreasValue } from '~/constants/focus-area';
import { SCHEDULE_TYPE, ScheduleTypeValue } from '~/constants/schedule-types';
import { TARGET_AUDIENCE, TargetAudienceValue } from '~/constants/target-audiences';

interface IWorkoutSchedule {
  day: DaysOfWeekValue | number;
  workoutId?: mongoose.Schema.Types.ObjectId;
  isRestDay?: boolean;
}

interface ICardioRecommendation {
  frequency: string;
  durationMinutes: number;
  type: string;
}

interface IProgram extends Document {
  name: string;
  description?: string;
  workoutSchedule: IWorkoutSchedule[];
  userId: mongoose.Schema.Types.ObjectId; 
  durationInDays?: number;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  isPublic?: boolean;
  scheduleType: ScheduleTypeValue;
  focusAreas?: FocusAreasValue[];
  targetAudience?: TargetAudienceValue;
  cardioRecommendations?: ICardioRecommendation;
  progressionStrategy?: string;
}

const ProgramSchema: Schema<IProgram> = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  workoutSchedule: [
    {
      day: { type: Schema.Types.Mixed, required: true }, 
      workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPrototype' },
      isRestDay: { type: Boolean, default: false },
    },
  ],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  durationInDays: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  notes: { type: String },
  isPublic: { type: Boolean, default: false },
  scheduleType: { type: String, enum: Object.values(SCHEDULE_TYPE), required: true },
  focusAreas: [{ type: String, enum: Object.values(FOCUS_AREAS) }], 
  targetAudience: { type: String, enum: Object.values(TARGET_AUDIENCE) },
  cardioRecommendations: {
    frequency: { type: String },
    durationMinutes: { type: Number },
    type: { type: String },
  },
  progressionStrategy: { type: String },
});


ProgramSchema.pre<IProgram>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

ProgramSchema.path('workoutSchedule').validate(function (workouts: IWorkoutSchedule[]) {
  const scheduleType = this.scheduleType;

  for (const workout of workouts) {
    if ((!workout.workoutId && !workout.isRestDay) || (workout.workoutId && workout.isRestDay)) {
      return false;
    }

    if (typeof workout.isRestDay === 'boolean' && workout.isRestDay) {
      continue;
    }

    if (
      scheduleType === SCHEDULE_TYPE.FIXED_DAYS &&
      (typeof workout.day !== 'string' || !Object.values(DAYS_OF_WEEK).includes(workout.day as DaysOfWeekValue))
    ) {
      return false;
    }

    if (scheduleType === SCHEDULE_TYPE.CYCLE && typeof workout.day !== 'number') {
      return false;
    }
  }

  return true;
}, 'Invalid workout schedule: Either `workoutId` or `isRestDay` must be set, but not both. `day` field must match `scheduleType`.');

ProgramSchema.index({ userId: 1 });
ProgramSchema.index({ scheduleType: 1 });
ProgramSchema.index({ isPublic: 1 });

const Program = mongoose.model<IProgram>('Program', ProgramSchema);

export { Program };
export type { IProgram };

