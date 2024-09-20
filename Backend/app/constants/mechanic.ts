export const MECHANIC = {
    COMPOUND: "compound",
    ISOLATION: "isolation",
} as const;

export type MechanicKey = keyof typeof MECHANIC;
export type MechanicValue = (typeof MECHANIC)[MechanicKey];
