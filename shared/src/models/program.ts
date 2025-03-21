import mongoose, { Document, Schema } from "mongoose";
import { DAYS_OF_WEEK, DaysOfWeekKey } from "../constants/days-of-week";
import { FOCUS_AREA, FocusAreasKey } from "../constants/focus-area";
import { LANGUAGE, LanguageKey } from "../constants/language";
import { SCHEDULE_TYPE, ScheduleTypeKey } from "../constants/schedule-type";
import {
    TARGET_AUDIENCE,
    TargetAudienceKey,
} from "../constants/target-audience";
import {
    defaultLocalizedField,
    localizedField,
    validateLocalizedField,
} from "../localization/utils";

interface IWorkoutSchedule {
    day: DaysOfWeekKey | number;
    workoutIds?: mongoose.Schema.Types.ObjectId[];
    isRestDay?: boolean;
}

interface IProgram extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    name: localizedField<string>;
    originalLanguage: LanguageKey;
    description?: localizedField<string>;
    workoutSchedule?: IWorkoutSchedule[];
    userId: mongoose.Schema.Types.ObjectId;
    isPublic: boolean;
    scheduleType: ScheduleTypeKey;
    focusAreas?: FocusAreasKey[];
    targetAudience?: TargetAudienceKey;
    createdAt: Date;
    updatedAt: Date;
}

const ProgramSchema: Schema<IProgram> = new Schema(
    {
        name: {
            type: Map,
            of: String,
            required: true,
            validate: {
                validator: validateLocalizedField,
                message: 'Invalid language key in "name" field.',
            },
        },
        originalLanguage: {
            type: String,
            enum: Object.keys(LANGUAGE),
            required: true,
        },
        description: {
            type: Map,
            of: String,
            default: defaultLocalizedField(""),
            validate: {
                validator: validateLocalizedField,
                message: 'Invalid language key in "description" field.',
            },
        },
        workoutSchedule: {
            type: [
                {
                    day: { type: Schema.Types.Mixed, required: true },
                    workoutIds: [
                        {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "WorkoutPrototype",
                        },
                    ],
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
        isPublic: { type: Boolean, default: false },
        scheduleType: {
            type: String,
            enum: Object.keys(SCHEDULE_TYPE),
            required: true,
        },
        focusAreas: [{ type: String, enum: Object.keys(FOCUS_AREA) }],
        targetAudience: { type: String, enum: Object.keys(TARGET_AUDIENCE) },
    },
    { timestamps: true },
);

ProgramSchema.path("workoutSchedule").validate(function (
    workouts: IWorkoutSchedule[],
) {
    const scheduleType = this.scheduleType;

    for (const workout of workouts) {
        const hasWorkoutIds =
            workout.workoutIds && workout.workoutIds.length > 0;

        if (
            (!hasWorkoutIds && !workout.isRestDay) ||
            (hasWorkoutIds && workout.isRestDay)
        ) {
            return false;
        }

        if (workout.isRestDay) {
            continue;
        }

        if (
            scheduleType === "WEEKLY" &&
            (typeof workout.day !== "string" ||
                !Object.keys(DAYS_OF_WEEK).includes(workout.day))
        ) {
            return false;
        }

        if (scheduleType === "CYCLE" && typeof workout.day !== "number") {
            return false;
        }
    }

    return true;
},
"Invalid workout schedule: Either 'workoutIds' must be a non-empty array or 'isRestDay' must be true, but not both. 'day' field must match 'scheduleType'.");

ProgramSchema.index({ userId: 1 });
ProgramSchema.index({ scheduleType: 1 });
ProgramSchema.index({ isPublic: 1 });

const Program = mongoose.model<IProgram>("Program", ProgramSchema);

export { Program };
export type { IProgram, IWorkoutSchedule };
