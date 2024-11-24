import { resolveLocalizedEnum } from './utils.js';

/**
 * Returns a localized version of the given `ISetPrototype` for the given `language`.
 *
 * Localizes the following fields:
 * - `type` (to a string representation of the `SET_TYPE` enum)
 * - `weightSelection.method` (to a string representation of the `WEIGHT_SELECTION_METHOD` enum, for Straight Set)
 * - `drops[].weightSelection.method` (to a string representation of the `WEIGHT_SELECTION_METHOD` enum, for Drop Set)
 * - `exercises[].weightSelection.method` (to a string representation of the `WEIGHT_SELECTION_METHOD` enum, for Superset)
 *
 * @param setPrototype The `ISetPrototype` to localize
 * @param language The language to localize to
 * @returns The localized `ILocalizedSetPrototype`
 */
function resolveLocalizedSetPrototype(setPrototype, language) {
    const localizedSetPrototype = { ...setPrototype };
    // Localize 'type' field
    localizedSetPrototype.type = resolveLocalizedEnum("SET_TYPE", setPrototype.type, language);
    // Localize 'weightSelection.method' for Straight Set
    if (setPrototype.weightSelection) {
        localizedSetPrototype.weightSelection = {
            ...setPrototype.weightSelection,
            method: resolveLocalizedEnum("WEIGHT_SELECTION_METHOD", setPrototype.weightSelection.method, language),
        };
    }
    // Localize 'drops[].weightSelection.method' for Drop Set
    if (setPrototype.drops) {
        localizedSetPrototype.drops = setPrototype.drops.map((drop) => ({
            ...drop,
            weightSelection: {
                ...drop.weightSelection,
                method: resolveLocalizedEnum("WEIGHT_SELECTION_METHOD", drop.weightSelection.method, language),
            },
        }));
    }
    // Localize 'exercises[].weightSelection.method' for Superset
    if (setPrototype.exercises) {
        localizedSetPrototype.exercises = setPrototype.exercises.map((exercise) => ({
            ...exercise,
            weightSelection: {
                ...exercise.weightSelection,
                method: resolveLocalizedEnum("WEIGHT_SELECTION_METHOD", exercise.weightSelection.method, language),
            },
        }));
    }
    return localizedSetPrototype;
}

export { resolveLocalizedSetPrototype };
//# sourceMappingURL=set-prototype.js.map
