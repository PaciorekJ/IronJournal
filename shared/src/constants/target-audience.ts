export const TARGET_AUDIENCE = {
    BEGINNER: "beginner",
    INTERMEDIATE: "intermediate",
    ADVANCED: "advanced",
} as const;

export type TargetAudienceKey = keyof typeof TARGET_AUDIENCE;