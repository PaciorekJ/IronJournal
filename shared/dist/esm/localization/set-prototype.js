import { localizeEnumField } from './utils.js';

function localizeSetPrototypeConstants(setPrototype, language) {
    const localizedSetPrototype = { ...setPrototype };
    // Localize 'type' field
    localizedSetPrototype.type = localizeEnumField("SET_TYPE", setPrototype.type, language);
    // Localize 'weightSelection.method' for Straight Set
    if (setPrototype.weightSelection) {
        localizedSetPrototype.weightSelection = {
            ...setPrototype.weightSelection,
            method: localizeEnumField("WEIGHT_SELECTION_METHOD", setPrototype.weightSelection.method, language),
        };
    }
    // Localize 'drops[].weightSelection.method' for Drop Set
    if (setPrototype.drops) {
        localizedSetPrototype.drops = setPrototype.drops.map((drop) => ({
            ...drop,
            weightSelection: {
                ...drop.weightSelection,
                method: localizeEnumField("WEIGHT_SELECTION_METHOD", drop.weightSelection.method, language),
            },
        }));
    }
    // Localize 'exercises[].weightSelection.method' for Superset
    if (setPrototype.exercises) {
        localizedSetPrototype.exercises = setPrototype.exercises.map((exercise) => ({
            ...exercise,
            weightSelection: {
                ...exercise.weightSelection,
                method: localizeEnumField("WEIGHT_SELECTION_METHOD", exercise.weightSelection.method, language),
            },
        }));
    }
    return localizedSetPrototype;
}

export { localizeSetPrototypeConstants };
//# sourceMappingURL=set-prototype.js.map
