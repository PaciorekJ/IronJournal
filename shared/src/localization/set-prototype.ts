import { LanguageKey } from "../constants/language";
import { IExercise } from "../models/exercise";
import { ISet, ITempo, NumberOrRange } from "../models/set-prototype";
import { resolveLocalizedEnum } from "./utils";

export interface ILocalizedSet
    extends Omit<
        ISet,
        | "type"
        | "straightSet"
        | "dropSet"
        | "restPauseSet"
        | "pyramidSet"
        | "isometricSet"
        | "amrapSet"
        | "superSet"
    > {
    type: string; // Localized 'type' field

    tempo?: ITempo;

    straightSet?: {
        exercise: IExercise["_id"];
        sets: {
            reps: NumberOrRange;
            weightSelection?: {
                method: string; // Localized 'method'
                value: number;
            };
        }[];
    };

    dropSet?: {
        exercise: IExercise["_id"];
        initialWeightSelection: {
            method: string; // Localized 'method'
            value: number;
        };
        sets: {
            loadReductionPercent: number;
            assisted?: boolean;
        }[];
    };

    restPauseSet?: {
        exercise: IExercise["_id"];
        weightSelection?: {
            method: string; // Localized 'method'
            value: number;
        };
        sets: {
            reps: NumberOrRange;
            restDurationInSeconds: NumberOrRange;
        }[];
    };

    pyramidSet?: {
        exercise: IExercise["_id"];
        sets: {
            reps: NumberOrRange;
            weightSelection?: {
                method: string; // Localized 'method'
                value: number;
            };
        }[];
    };

    isometricSet?: {
        exercise: IExercise["_id"];
        sets: {
            durationInSeconds: NumberOrRange;
            weightSelection?: {
                method: string; // Localized 'method'
                value: number;
            };
        }[];
    };

    amrapSet?: {
        exercise: IExercise["_id"];
        sets: {
            timeFrameInSeconds?: NumberOrRange;
            weightSelection?: {
                method: string; // Localized 'method'
                value: number;
            };
        }[];
    };

    superSet?: {
        sets: ILocalizedSet[]; // Recursive definition to handle nested supersets
    };
}

/**
 * Returns a localized version of the given `ISet` for the given `language`.
 *
 * Localizes the following fields:
 * - `type` (to a string representation of the `SET_TYPE` enum)
 * - `weightSelection.method` fields in all set types where applicable
 *
 * @param set The `ISet` to localize
 * @param language The language to localize to
 * @returns The localized `ILocalizedSetPrototype`
 */
export function resolveLocalizedSet(
    set: ISet,
    language: LanguageKey,
): ILocalizedSet {
    const localizedSetPrototype = { ...set } as any;

    // Localize 'type' field
    localizedSetPrototype.type = resolveLocalizedEnum(
        "SET_TYPE",
        set.type,
        language,
    );

    // Localize 'tempo' if present (assuming no localization needed for numerical values)
    if (set.tempo) {
        localizedSetPrototype.tempo = { ...set.tempo };
    }

    // Handle Straight Set
    if (set.straightSet) {
        localizedSetPrototype.straightSet = {
            ...set.straightSet,
            sets: set.straightSet.sets.map((entry) => ({
                ...entry,
                weightSelection: entry.weightSelection
                    ? {
                          ...entry.weightSelection,
                          method: resolveLocalizedEnum(
                              "WEIGHT_SELECTION_METHOD",
                              entry.weightSelection.method,
                              language,
                          ),
                      }
                    : undefined,
            })),
        };
    }

    // Handle Drop Set
    if (set.dropSet) {
        localizedSetPrototype.dropSet = {
            ...set.dropSet,
            initialWeightSelection: {
                ...set.dropSet.initialWeightSelection,
                method: resolveLocalizedEnum(
                    "WEIGHT_SELECTION_METHOD",
                    set.dropSet.initialWeightSelection.method,
                    language,
                ),
            },
            // Entries in Drop Set do not have weightSelection
            sets: set.dropSet.sets.map((entry) => ({ ...entry })),
        };
    }

    // Handle Rest-Pause Set
    if (set.restPauseSet) {
        localizedSetPrototype.restPauseSet = {
            ...set.restPauseSet,
            weightSelection: set.restPauseSet.weightSelection
                ? {
                      ...set.restPauseSet.weightSelection,
                      method: resolveLocalizedEnum(
                          "WEIGHT_SELECTION_METHOD",
                          set.restPauseSet.weightSelection.method,
                          language,
                      ),
                  }
                : undefined,
            sets: set.restPauseSet.sets.map((entry) => ({ ...entry })),
        };
    }

    // Handle Pyramid Set
    if (set.pyramidSet) {
        localizedSetPrototype.pyramidSet = {
            ...set.pyramidSet,
            sets: set.pyramidSet.sets.map((entry) => ({
                ...entry,
                weightSelection: entry.weightSelection
                    ? {
                          ...entry.weightSelection,
                          method: resolveLocalizedEnum(
                              "WEIGHT_SELECTION_METHOD",
                              entry.weightSelection.method,
                              language,
                          ),
                      }
                    : undefined,
            })),
        };
    }

    // Handle Isometric Set
    if (set.isometricSet) {
        localizedSetPrototype.isometricSet = {
            ...set.isometricSet,
            sets: set.isometricSet.sets.map((entry) => ({
                ...entry,
                weightSelection: entry.weightSelection
                    ? {
                          ...entry.weightSelection,
                          method: resolveLocalizedEnum(
                              "WEIGHT_SELECTION_METHOD",
                              entry.weightSelection.method,
                              language,
                          ),
                      }
                    : undefined,
            })),
        };
    }

    // Handle AMRAP Set
    if (set.amrapSet) {
        localizedSetPrototype.amrapSet = {
            ...set.amrapSet,
            sets: set.amrapSet.sets.map((entry) => ({
                ...entry,
                weightSelection: entry.weightSelection
                    ? {
                          ...entry.weightSelection,
                          method: resolveLocalizedEnum(
                              "WEIGHT_SELECTION_METHOD",
                              entry.weightSelection.method,
                              language,
                          ),
                      }
                    : undefined,
            })),
        };
    }

    // Handle Superset
    if (set.superSet) {
        localizedSetPrototype.superSet = {
            ...set.superSet,
            sets: set.superSet.sets.map((subSet) =>
                resolveLocalizedSet(subSet, language),
            ),
        };
    }

    return localizedSetPrototype as ILocalizedSet;
}
