export const FORCE = {
    PUSH: "push",
    PULL: "pull",
    STATIC: "static",
} as const;

export type ForceKey = keyof typeof FORCE;
