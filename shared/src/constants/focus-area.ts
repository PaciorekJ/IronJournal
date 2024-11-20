export const FOCUS_AREA = {
    HYPERTROPHY: "hypertrophy",
    FAT_LOSS: "fatLoss",
    STRENGTH: "strength",
    ENDURANCE: "endurance",
} as const;

export type FocusAreasKey = keyof typeof FOCUS_AREA;
