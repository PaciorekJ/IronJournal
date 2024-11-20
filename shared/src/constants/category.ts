export const CATEGORY = {
    STRENGTH: "strength",
    STRETCHING: "stretching",
    CARDIO: "cardio",
    PLYOMETRICS: "plyometrics",
    POWERLIFTING: "powerlifting",
    STRONGMAN: "strongman",
    OLYMPIC_WEIGHTLIFTING: "olympic weightlifting",
} as const;

export type CategoryKey = keyof typeof CATEGORY;