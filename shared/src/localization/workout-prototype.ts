import { LanguageKey } from "../constants/language";
import { IWorkoutPrototype } from "../models/workout-prototype";
import {
    ILocalizedSetPrototype,
    localizeSetPrototypeConstants,
} from "./set-prototype";
import { localizeEnumField } from "./utils";

export interface ILocalizedWorkoutPrototype
    extends Omit<
        IWorkoutPrototype,
        "name" | "description" | "intensityLevel" | "sets"
    > {
    name: string;
    description?: string;
    intensityLevel?: string;
    sets: ILocalizedSetPrototype[];
}

export function localizeWorkoutPrototypeConstants(
    workout: IWorkoutPrototype,
    language: LanguageKey,
): ILocalizedWorkoutPrototype {
    const localizedWorkout = { ...workout } as any;

    // Localize 'name' field
    localizedWorkout.name = workout.name[language] || workout.name["en"] || "";

    // Localize 'description' field
    if (workout.description) {
        localizedWorkout.description =
            workout.description[language] || workout.description["en"] || "";
    }

    // Localize 'intensityLevel' field
    if (workout.intensityLevel) {
        localizedWorkout.intensityLevel = localizeEnumField(
            "INTENSITY_LEVEL",
            workout.intensityLevel,
            language,
        );
    }

    // Localize 'sets' array
    localizedWorkout.sets = workout.sets.map((set) =>
        localizeSetPrototypeConstants(set, language),
    );

    return localizedWorkout as ILocalizedWorkoutPrototype;
}
