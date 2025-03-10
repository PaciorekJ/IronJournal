import { LanguageKey } from "../constants/language";
import { IExercise } from "../models/exercise";
import { resolveLocalizedEnum, resolveLocalizedField } from "./utils";
export interface ILocalizedExercise
    extends Omit<
        IExercise,
        | "level"
        | "force"
        | "mechanic"
        | "equipment"
        | "category"
        | "primaryMuscles"
        | "secondaryMuscles"
        | "name"
        | "instructions"
    > {
    name: string;
    instructions: string[];
    level: string;
    force?: string;
    mechanic?: string;
    equipment?: string;
    primaryMuscles: string[];
    secondaryMuscles?: string[];
    category: string;
}

/**
 * Resolve a localized exercise object.
 *
 * The function will look up the given `exercise` fields in the
 * `CONSTANT_LOCALIZATIONS` object for the given `language`. If the value is
 * present, it will be returned. If not, the original value will be returned.
 *
 * @param exercise - The exercise to resolve.
 * @param language - The language to resolve for.
 */
export function resolveLocalizedExercise(
    exercise: IExercise,
    language: LanguageKey,
): ILocalizedExercise {
    const localizedExercise = { ...exercise } as any;

    // Localize 'name' field
    if (exercise.name) {
        localizedExercise.name = resolveLocalizedField(
            localizedExercise.name,
            exercise.originalLanguage,
            language,
        );
    }

    // Localize 'instructions' field
    if (exercise.instructions) {
        localizedExercise.instructions = resolveLocalizedField(
            localizedExercise.instructions,
            exercise.originalLanguage,
            language,
        );
    }

    // Localize enum fields
    localizedExercise.level = resolveLocalizedEnum(
        "LEVEL",
        exercise.level,
        language,
    );
    localizedExercise.force = exercise.force
        ? resolveLocalizedEnum("FORCE", exercise.force, language)
        : undefined;
    localizedExercise.mechanic = exercise.mechanic
        ? resolveLocalizedEnum("MECHANIC", exercise.mechanic, language)
        : undefined;
    localizedExercise.equipment = exercise.equipment
        ? resolveLocalizedEnum("EQUIPMENT", exercise.equipment, language)
        : undefined;
    localizedExercise.category = resolveLocalizedEnum(
        "CATEGORY",
        exercise.category,
        language,
    );

    // Localize array fields
    localizedExercise.primaryMuscles = exercise.primaryMuscles.map((muscle) =>
        resolveLocalizedEnum("MUSCLE_GROUP", muscle, language),
    );
    localizedExercise.secondaryMuscles = exercise.secondaryMuscles
        ? exercise.secondaryMuscles.map((muscle) =>
              resolveLocalizedEnum("MUSCLE_GROUP", muscle, language),
          )
        : undefined;

    return localizedExercise as ILocalizedExercise;
}
