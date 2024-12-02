import { resolveLocalizedSet } from './set-prototype.js';
import { resolveLocalizedField, resolveLocalizedEnum } from './utils.js';

function resolveLocalizedWorkout(workout, language) {
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
    return localizedWorkout;
}

export { resolveLocalizedWorkout };
//# sourceMappingURL=workout-prototype.js.map
