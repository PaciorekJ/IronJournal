import { LanguageKey } from "../constants/language";
import { SET_TYPE } from "../constants/set-type";
import {
    IAmrapSet,
    IAmrapSetEntry,
    ICardioSetEntry,
    IDropSet,
    IDropSetEntry,
    IIsometricSet,
    IIsometricSetEntry,
    IPyramidSet,
    IPyramidSetEntry,
    IRestPauseSet,
    IRestPauseSetEntry,
    IStraightSet,
    IStraightSetEntry,
    ISuperset,
} from "../validation";
import { ISet } from "../validation/sets";
import { resolveLocalizedEnum } from "./utils";

// Sets are the same types for localization, but this is guaranteed to localized

interface IAmrapSetLocalizedEntry extends IAmrapSetEntry {}
interface ICardioSetLocalizedEntry extends ICardioSetEntry {}
interface IRestPauseSetLocalizedEntry extends IRestPauseSetEntry {}
interface IStraightSetLocalizedEntry extends IStraightSetEntry {}
interface IDropSetLocalizedEntry extends IDropSetEntry {}
interface IPyramidSetLocalizedEntry extends IPyramidSetEntry {}
interface IIsometricSetLocalizedEntry extends IIsometricSetEntry {}

type ILocalizedSetEntry =
    | IAmrapSetLocalizedEntry
    | ICardioSetLocalizedEntry
    | IRestPauseSetLocalizedEntry
    | IStraightSetLocalizedEntry
    | IDropSetLocalizedEntry
    | IPyramidSetLocalizedEntry
    | IIsometricSetLocalizedEntry;

export interface ILocalizedSet extends Omit<ISet, "type" | "sets"> {
    type: string; // Localized 'type' field
    sets: [ILocalizedSetEntry];
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
 * @returns The localized `ILocalizedSet`
 */
export function resolveLocalizedSet(
    set: ISet,
    language: LanguageKey,
): ILocalizedSet {
    const localizedSet = set as any;

    localizedSet.type = resolveLocalizedEnum("SET_TYPE", set.type, language);

    if (
        set.type === SET_TYPE.AMRAP_SET ||
        set.type === SET_TYPE.ISOMETRIC_SET ||
        set.type === SET_TYPE.PYRAMID_SET ||
        set.type === SET_TYPE.REVERSE_PYRAMID_SET ||
        set.type === SET_TYPE.NON_LINEAR_PYRAMID_SET ||
        set.type === SET_TYPE.STRAIGHT_SET
    ) {
        const amrapSet = localizedSet as
            | IAmrapSet
            | IIsometricSet
            | IPyramidSet
            | IStraightSet;
        amrapSet.sets.map((setEntry) => {
            if (setEntry.weightSelection) {
                setEntry.weightSelection.method = resolveLocalizedEnum(
                    "WEIGHT_SELECTION_METHOD",
                    setEntry.weightSelection.method,
                    language,
                );
            }
            return setEntry;
        });

        return amrapSet as unknown as ILocalizedSet;
    }

    if (set.type === SET_TYPE.DROP_SET) {
        const dropSet = localizedSet as IDropSet;
        dropSet.initialWeightSelection.method = resolveLocalizedEnum(
            "WEIGHT_SELECTION_METHOD",
            dropSet.initialWeightSelection.method,
            language,
        );

        return dropSet as unknown as ILocalizedSet;
    }

    if (set.type === SET_TYPE.REST_PAUSE_SET) {
        const restPauseSet = localizedSet as IRestPauseSet;
        if (restPauseSet.weightSelection) {
            restPauseSet.weightSelection.method = resolveLocalizedEnum(
                "WEIGHT_SELECTION_METHOD",
                restPauseSet.weightSelection.method,
                language,
            );
        }

        return restPauseSet as unknown as ILocalizedSet;
    }

    if (set.type === SET_TYPE.SUPER_SET) {
        const superset = localizedSet as ISuperset;
        superset.sets.map((setEntry: ISet) => {
            resolveLocalizedSet(setEntry, language);
            return setEntry;
        });

        return superset as unknown as ILocalizedSet;
    }

    // Cardio set needs no Localizations
    // Rest set need no Localizations

    return localizedSet as ILocalizedSet;
}
