export const CATEGORY = {
    STRENGTH: "strength",
    STRETCHING: "stretching",
    PLYOMETRICS: "plyometrics",
    POWERLIFTING: "powerlifting",
    STRONGMAN: "strongman",
} as const;

export type CategoryKey = keyof typeof CATEGORY;
export type CategoryValue = (typeof CATEGORY)[CategoryKey];
