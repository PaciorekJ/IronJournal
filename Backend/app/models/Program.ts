import mongoose, { Document, Schema } from "mongoose";
import { DAYS_OF_WEEK, DaysOfWeekValue } from "~/constants/days-of-week";
import { FOCUS_AREAS, FocusAreasValue } from "~/constants/focus-area";
import { SCHEDULE_TYPE, ScheduleTypeValue } from "~/constants/schedule-types";
import {
    TARGET_AUDIENCE,
    TargetAudienceValue,
} from "~/constants/target-audiences";
import { Timestamps } from "~/interfaces/timestamp";

interface IWorkoutSchedule {
    day: DaysOfWeekValue | number;
    workoutId?: mongoose.Schema.Types.ObjectId;
    isRestDay?: boolean;
}

interface ICardioRecommendation {
    frequency: string;
    durationInMinutes: number;
    type: string;
}

interface IProgram extends Document, Timestamps {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    description?: string;
    workoutSchedule?: IWorkoutSchedule[];
    userId: mongoose.Schema.Types.ObjectId;
    durationInDays?: number;
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
    workoutSchedule: {
        type: [
            {
                day: { type: Schema.Types.Mixed, required: true },
                workoutId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "WorkoutPrototype",
                },
                isRestDay: { type: Boolean, default: false },
            },
        ],
        default: [],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    durationInDays: { type: Number },
    notes: { type: String },
    isPublic: { type: Boolean, default: false },
    scheduleType: {
        type: String,
        enum: Object.values(SCHEDULE_TYPE),
        required: true,
    },
    focusAreas: [{ type: String, enum: Object.values(FOCUS_AREAS) }],
    targetAudience: { type: String, enum: Object.values(TARGET_AUDIENCE) },
    cardioRecommendations: {
        frequency: { type: String },
        durationInMinutes: { type: Number },
        type: { type: String },
    },
    progressionStrategy: { type: String },
}, { timestamps: true });

ProgramSchema.path("workoutSchedule").validate(function (
    workouts: IWorkoutSchedule[],
) {
    const scheduleType = this.scheduleType;

    for (const workout of workouts) {
        if (
            (!workout.workoutId && !workout.isRestDay) ||
            (workout.workoutId && workout.isRestDay)
        ) {
            return false;
        }

        if (typeof workout.isRestDay === "boolean" && workout.isRestDay) {
            continue;
        }

        if (
            scheduleType === SCHEDULE_TYPE.FIXED_DAYS &&
            (typeof workout.day !== "string" ||
                !Object.values(DAYS_OF_WEEK).includes(
                    workout.day as DaysOfWeekValue,
                ))
        ) {
            return false;
        }

        if (
            scheduleType === SCHEDULE_TYPE.CYCLE &&
            typeof workout.day !== "number"
        ) {
            return false;
        }
    }

    return true;
}, "Invalid workout schedule: Either `workoutId` or `isRestDay` must be set, but not both. `day` field must match `scheduleType`.");

ProgramSchema.index({ userId: 1 });
ProgramSchema.index({ scheduleType: 1 });
ProgramSchema.index({ isPublic: 1 });

const Program = mongoose.model<IProgram>("Program", ProgramSchema);

export { Program };
export type { IProgram };
