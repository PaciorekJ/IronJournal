import { IUser } from "@paciorekj/iron-journal-shared";
import configureMeasurements from "convert-units";
import length from "convert-units/definitions/length";
import mass from "convert-units/definitions/mass";
import volume from "convert-units/definitions/volume";

const volumeConvert = configureMeasurements({
    volume,
});

const lengthConvert = configureMeasurements({
    length,
});

const massConvert = configureMeasurements({
    mass,
});

export interface IUnitsDistance {
    cm: number;
    m: number;
    km: number;

    inches: number;
    ft: number;
    mi: number;
}

/**
 * Converts all units of measurement for distance to centimeters.
 *
 * @param {IUnitsDistance} units
 * @param {IUser["measurementSystemPreference"]} measurementSystemPreference
 * @returns {number} The total distance in centimeters.
 */
export function normalizeDistance(
    units: IUnitsDistance,
    measurementSystemPreference: IUser["measurementSystemPreference"],
): number {
    if (measurementSystemPreference === "METRIC") {
        return [
            units.m || 0,
            lengthConvert(units.m || 0)
                .from("m")
                .to("cm"),
            lengthConvert(units.km || 0)
                .from("km")
                .to("cm"),
        ].reduce((a, b) => a + b, 0);
    }

    return [
        lengthConvert(units.inches || 0)
            .from("in")
            .to("cm"),
        lengthConvert(units.ft || 0)
            .from("ft")
            .to("cm"),
        lengthConvert(units.mi || 0)
            .from("mi")
            .to("cm"),
    ].reduce((a, b) => a + b, 0);
}

export interface IUnitsWeight {
    kg: number;

    lb: number;
}

/**
 * Normalize weight units to kilograms.
 *
 * @param {IUnitsWeight} units
 * @param {IUser["measurementSystemPreference"]} measurementSystemPreference
 * @returns {number} The total weight in kilograms.
 */
export function normalizeWeight(
    units: IUnitsWeight,
    measurementSystemPreference: IUser["measurementSystemPreference"],
) {
    if (measurementSystemPreference === "METRIC") {
        return units.kg || 0;
    }
    return massConvert(units.lb || 0)
        .from("lb")
        .to("kg");
}

export interface IUnitsVolume {
    ml: number;
    l: number;

    fluidOz: number;
    gal: number;
}

/**
 * Normalize volume units to milliliters.
 *
 * @param {IUnitsVolume} units The object of volume units to normalize.
 * @param {IUser["measurementSystemPreference"]} measurementSystemPreference
 * The measurement system preference of the user.
 * @returns {number} The total volume in milliliters.
 */
export function normalizeVolume(
    units: IUnitsVolume,
    measurementSystemPreference: IUser["measurementSystemPreference"],
) {
    if (measurementSystemPreference === "METRIC") {
        return [
            units.ml || 0,
            volumeConvert(units.l || 0)
                .from("l")
                .to("ml"),
        ].reduce((a, b) => a + b, 0);
    }
    return [
        volumeConvert(units.fluidOz || 0)
            .from("fl-oz")
            .to("ml"),
        volumeConvert(units.gal || 0)
            .from("gal")
            .to("ml"),
    ].reduce((a, b) => a + b, 0);
}

/**
 * Converts a standardized distance (in cm) to the user's preferred measurement system.
 *
 * @param {number} cm - The distance in centimeters.
 * @param {IUser["measurementSystemPreference"]} measurementSystemPreference - The user's measurement system.
 * @returns {IUnitsDistance} The converted values.
 */
export function deNormalizeDistance(
    cm: number,
    measurementSystemPreference: IUser["measurementSystemPreference"],
): IUnitsDistance {
    if (measurementSystemPreference === "METRIC") {
        return {
            cm,
            m: lengthConvert(cm).from("cm").to("m"),
            km: lengthConvert(cm).from("cm").to("km"),

            inches: 0,
            ft: 0,
            mi: 0,
        };
    }

    return {
        cm,
        m: 0,
        km: 0,

        inches: lengthConvert(cm).from("cm").to("in"),
        ft: lengthConvert(cm).from("cm").to("ft"),
        mi: lengthConvert(cm).from("cm").to("mi"),
    };
}

/**
 * Converts a standardized weight (in kg) to the user's preferred measurement system.
 *
 * @param {number} kg - The weight in kilograms.
 * @param {IUser["measurementSystemPreference"]} measurementSystemPreference - The user's measurement system.
 * @returns {IUnitsWeight} The converted values.
 */
export function deNormalizeWeight(
    kg: number,
    measurementSystemPreference: IUser["measurementSystemPreference"],
): IUnitsWeight {
    if (measurementSystemPreference === "METRIC") {
        return { kg, lb: 0 };
    }

    return {
        kg,
        lb: massConvert(kg).from("kg").to("lb"),
    };
}

/**
 * Converts a standardized volume (in ml) to the user's preferred measurement system.
 *
 * @param {number} ml - The volume in milliliters.
 * @param {IUser["measurementSystemPreference"]} measurementSystemPreference - The user's measurement system.
 * @returns {IUnitsVolume} The converted values.
 */
export function deNormalizeVolume(
    ml: number,
    measurementSystemPreference: IUser["measurementSystemPreference"],
): IUnitsVolume {
    if (measurementSystemPreference === "METRIC") {
        return {
            ml,
            l: volumeConvert(ml).from("ml").to("l"),

            fluidOz: 0,
            gal: 0,
        };
    }

    return {
        ml,
        l: 0,

        fluidOz: volumeConvert(ml).from("ml").to("fl-oz"),
        gal: volumeConvert(ml).from("ml").to("gal"),
    };
}
