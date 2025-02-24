import { IUser } from "../models/user";
import { IWorkout } from "../models/workout";
import { ILocalizedSet, resolveLocalizedSet } from "./set";
import { resolveLocalizedEnum, resolveLocalizedField } from "./utils";

export interface ILocalizedWorkout
    extends Omit<IWorkout, "name" | "description" | "intensityLevel" | "sets"> {
    name: string;
    description?: string;
    intensityLevel?: string;
    sets: ILocalizedSet[];
}

export function resolveLocalizedWorkout(
    workout: IWorkout,
    { languagePreference: language, timezone }: IUser,
): ILocalizedWorkout {
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

    return localizedWorkout as ILocalizedWorkout;
}
