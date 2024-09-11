import mongoose, { Document, Schema } from 'mongoose';

// Object-based enums for schedule types, focus areas, target audience, and intensity levels
const ScheduleType = {
  Cycle: 'cycle',
  FixedDays: 'fixed-days',
} as const;

const FocusAreas = {
  Hypertrophy: 'hypertrophy',
  FatLoss: 'fatLoss',
  Strength: 'strength',
  Endurance: 'endurance',
} as const;

const TargetAudience = {
  Beginner: 'beginner',
  Intermediate: 'intermediate',
  Advanced: 'advanced',
} as const;

const IntensityLevel = {
  Low: 'low',
  Moderate: 'moderate',
  High: 'high',
} as const;

// Derive TypeScript types from the object-based enums
type ScheduleType = (typeof ScheduleType)[keyof typeof ScheduleType];
type FocusAreaType = (typeof FocusAreas)[keyof typeof FocusAreas];
type TargetAudienceType = (typeof TargetAudience)[keyof typeof TargetAudience];
type IntensityLevelType = (typeof IntensityLevel)[keyof typeof IntensityLevel];

// Interface for WorkoutSchedule
interface IWorkoutSchedule {
  day: string | number; 
  workoutId?: mongoose.Schema.Types.ObjectId; 
  isRestDay?: boolean; 
  duration?: number; 
  intensityLevel?: IntensityLevelType; 
}

// Interface for Program
interface IProgram extends Document {
  name: string;
  description?: string;
  workouts: IWorkoutSchedule[];
  userId: mongoose.Schema.Types.ObjectId;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  isPublic?: boolean;
  scheduleType: ScheduleType;
  focusAreas?: FocusAreaType[];
  targetAudience?: TargetAudienceType;
  cardioRecommendations?: {
    frequency: string; 
    intensity: IntensityLevelType; 
    duration: string; 
    type: string; 
  };
  progressionStrategy?: string;
}

// Convert enum values to arrays for Mongoose schema enums
const ScheduleTypeValues = Object.values(ScheduleType);
const FocusAreaValues = Object.values(FocusAreas);
const TargetAudienceValues = Object.values(TargetAudience);
const IntensityLevelValues = Object.values(IntensityLevel);

// Program Schema definition
const ProgramSchema: Schema<IProgram> = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  workouts: [
    {
      day: { type: Schema.Types.Mixed, required: true },
      workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPrototype' },
      isRestDay: { type: Boolean, default: false },
      duration: { type: Number },
      intensityLevel: { type: String, enum: IntensityLevelValues },
    }
  ],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duration: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  notes: { type: String },
  isPublic: { type: Boolean, default: false },
  scheduleType: { type: String, enum: ScheduleTypeValues, required: true },
  focusAreas: [{ type: String, enum: FocusAreaValues }],
  targetAudience: { type: String, enum: TargetAudienceValues },
  cardioRecommendations: {
    frequency: { type: String },
    intensity: { type: String, enum: IntensityLevelValues },
    duration: { type: String },
    type: { type: String },
  },
  progressionStrategy: { type: String },
});

ProgramSchema.pre<IProgram>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

ProgramSchema.path('workouts').validate(function (workouts: IWorkoutSchedule[]) {
  const scheduleType = this.scheduleType;
  
  for (const workout of workouts) {
    if (scheduleType === 'fixed-days' && typeof workout.day !== 'string') {
      return false;
    }
    if (scheduleType === 'cycle' && typeof workout.day !== 'number') {
      return false;
    }
  }
  
  return true;
}, 'Invalid workout schedule: `day` field does not match `scheduleType`.');

ProgramSchema.index({ userId: 1 });
ProgramSchema.index({ scheduleType: 1 });
ProgramSchema.index({ isPublic: 1 });

const Program = mongoose.model<IProgram>('Program', ProgramSchema);

export { FocusAreas, IntensityLevel, Program, ScheduleType, TargetAudience };
export type { IProgram };

