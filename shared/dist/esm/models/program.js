import mongoose, { Schema } from 'mongoose';
import { DAYS_OF_WEEK } from '../constants/days-of-week.js';
import { FOCUS_AREA } from '../constants/focus-area.js';
import { LANGUAGE } from '../constants/language.js';
import { SCHEDULE_TYPE } from '../constants/schedule-type.js';
import { TARGET_AUDIENCE } from '../constants/target-audience.js';
import { validateLocalizedField, defaultLocalizedField } from '../localization/utils.js';

const ProgramSchema = new Schema({
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
        default: "en",
    },
    description: {
        type: Map,
        of: String,
        default: defaultLocalizedField(),
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
    repetitions: { type: Number, default: 0 },
}, { timestamps: true });
ProgramSchema.path("workoutSchedule").validate(function (workouts) {
    const scheduleType = this.scheduleType;
    for (const workout of workouts) {
        const hasWorkoutIds = workout.workoutIds && workout.workoutIds.length > 0;
        if ((!hasWorkoutIds && !workout.isRestDay) ||
            (hasWorkoutIds && workout.isRestDay)) {
            return false;
        }
        if (workout.isRestDay) {
            continue;
        }
        if (scheduleType === "WEEKLY" &&
            (typeof workout.day !== "string" ||
                !Object.keys(DAYS_OF_WEEK).includes(workout.day))) {
            return false;
        }
        if (scheduleType === "CYCLE" && typeof workout.day !== "number") {
            return false;
        }
    }
    return true;
}, "Invalid workout schedule: Either 'workoutIds' must be a non-empty array or 'isRestDay' must be true, but not both. 'day' field must match 'scheduleType'.");
ProgramSchema.index({ userId: 1 });
ProgramSchema.index({ scheduleType: 1 });
ProgramSchema.index({ isPublic: 1 });
const Program = mongoose.model("Program", ProgramSchema);

export { Program };
//# sourceMappingURL=program.js.map
