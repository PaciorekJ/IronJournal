export const LEVEL = {
    BEGINNER: "beginner",
    INTERMEDIATE: "intermediate",
    EXPERT: "expert",
} as const;

export type LevelKey = keyof typeof LEVEL;
