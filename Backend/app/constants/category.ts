export const CATEGORY = {
    STRENGTH: "strength",
    STRETCHING: "stretching",
    CARDIO: "cardio",
    PLYOMETRICS: "plyometrics",
    POWERLIFTING: "powerlifting",
    STRONGMAN: "strongman",
    OLYMPIC: "olympic weightlifting",
} as const;

export type CategoryKey = keyof typeof CATEGORY;
export type CategoryValue = (typeof CATEGORY)[CategoryKey];
