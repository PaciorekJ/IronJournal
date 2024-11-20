import { localizeSetPrototypeConstants } from './set-prototype.js';
import { localizeEnumField } from './utils.js';

function localizeWorkoutPrototypeConstants(workout, language) {
    const localizedWorkout = { ...workout };
    // Localize 'name' field
    localizedWorkout.name = workout.name[language] || workout.name["en"] || "";
    // Localize 'description' field
    if (workout.description) {
        localizedWorkout.description =
            workout.description[language] || workout.description["en"] || "";
    }
    // Localize 'intensityLevel' field
    if (workout.intensityLevel) {
        localizedWorkout.intensityLevel = localizeEnumField("INTENSITY_LEVEL", workout.intensityLevel, language);
    }
    // Localize 'sets' array
    localizedWorkout.sets = workout.sets.map((set) => localizeSetPrototypeConstants(set, language));
    return localizedWorkout;
}

export { localizeWorkoutPrototypeConstants };
//# sourceMappingURL=workout-prototype.js.map
