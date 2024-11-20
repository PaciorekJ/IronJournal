export const INTENSITY_LEVEL = {
    LOW: "low",
    MODERATE: "moderate",
    HIGH: "high",
} as const;

export type IntensityLevelKey = keyof typeof INTENSITY_LEVEL;
