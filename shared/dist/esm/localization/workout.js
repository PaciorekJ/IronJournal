import { resolveLocalizedSet } from './set.js';
import { resolveLocalizedField, resolveLocalizedEnum, localizeDate } from './utils.js';

function resolveLocalizedWorkout(workout, { languagePreference: language, timezone }) {
    const localizedWorkout = { ...workout };
    localizedWorkout.name = resolveLocalizedField(localizedWorkout.name, workout.originalLanguage, language);
    if (workout.description) {
        localizedWorkout.description = resolveLocalizedField(localizedWorkout.description, workout.originalLanguage, language);
    }
    if (workout.intensityLevel) {
        localizedWorkout.intensityLevel = resolveLocalizedEnum("INTENSITY_LEVEL", workout.intensityLevel, language);
    }
    // Localize 'sets' array
    localizedWorkout.sets = workout.sets.map((set) => resolveLocalizedSet(set, language));
    localizedWorkout.createdAt = localizeDate(localizedWorkout.createdAt, language, timezone);
    localizedWorkout.updatedAt = localizeDate(localizedWorkout.updatedAt, language, timezone);
    return localizedWorkout;
}

export { resolveLocalizedWorkout };
//# sourceMappingURL=workout.js.map
