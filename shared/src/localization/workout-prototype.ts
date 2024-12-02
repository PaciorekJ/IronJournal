import { LanguageKey } from "../constants/language";
import { IWorkoutPrototype } from "../models/workout-prototype";
import { ILocalizedSet, resolveLocalizedSet } from "./set-prototype";
import { resolveLocalizedEnum, resolveLocalizedField } from "./utils";

export interface ILocalizedWorkoutPrototype
    extends Omit<
        IWorkoutPrototype,
        "name" | "description" | "intensityLevel" | "sets"
    > {
    name: string;
    description?: string;
    intensityLevel?: string;
    sets: ILocalizedSet[];
}

export function resolveLocalizedWorkout(
    workout: IWorkoutPrototype,
    language: LanguageKey,
): ILocalizedWorkoutPrototype {
    const localizedWorkout = { ...workout } as any;

    localizedWorkout.name = resolveLocalizedField(
        localizedWorkout.name,
        workout.originalLanguage,
        language,
    );

    if (workout.description) {
        localizedWorkout.description = resolveLocalizedField(
            localizedWorkout.description,
            workout.originalLanguage,
            language,
        );
    }

    if (workout.intensityLevel) {
        localizedWorkout.intensityLevel = resolveLocalizedEnum(
            "INTENSITY_LEVEL",
            workout.intensityLevel,
            language,
        );
    }

    // Localize 'sets' array
    localizedWorkout.sets = workout.sets.map((set) =>
        resolveLocalizedSet(set, language),
    );

    return localizedWorkout as ILocalizedWorkoutPrototype;
}
