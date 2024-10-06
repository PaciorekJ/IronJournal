import { LanguageKey } from "~/constants/language";
import { IExercise } from "~/models/exercise";
import { localizeEnumField } from "./utils.server";

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

export function localizeExerciseConstants(
    exercise: IExercise,
    language: LanguageKey,
): ILocalizedExercise {
    const localizedExercise = { ...exercise } as any;

    // Localize 'name' field
    if (exercise.name) {
        localizedExercise.name =
            exercise.name[language] || exercise.name["en"] || "";
    }

    // Localize 'instructions' field
    if (exercise.instructions) {
        localizedExercise.instructions = exercise.instructions.map(
            (instruction) => instruction[language] || instruction["en"] || "",
        );
    }

    // Localize enum fields
    localizedExercise.level = localizeEnumField(
        "LEVEL",
        exercise.level,
        language,
    );
    localizedExercise.force = exercise.force
        ? localizeEnumField("FORCE", exercise.force, language)
        : undefined;
    localizedExercise.mechanic = exercise.mechanic
        ? localizeEnumField("MECHANIC", exercise.mechanic, language)
        : undefined;
    localizedExercise.equipment = exercise.equipment
        ? localizeEnumField("EQUIPMENT", exercise.equipment, language)
        : undefined;
    localizedExercise.category = localizeEnumField(
        "CATEGORY",
        exercise.category,
        language,
    );

    // Localize array fields
    localizedExercise.primaryMuscles = exercise.primaryMuscles.map((muscle) =>
        localizeEnumField("MUSCLE_GROUP", muscle, language),
    );
    localizedExercise.secondaryMuscles = exercise.secondaryMuscles
        ? exercise.secondaryMuscles.map((muscle) =>
              localizeEnumField("MUSCLE_GROUP", muscle, language),
          )
        : undefined;

    return localizedExercise as ILocalizedExercise;
}
