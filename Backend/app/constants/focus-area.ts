export const FOCUS_AREAS = {
    HYPERTROPHY: 'hypertrophy',
    FAT_LOSS: 'fatLoss',
    STRENGTH: 'strength',
    ENDURANCE: 'endurance',
} as const;

export type FocusAreasKey = keyof typeof FOCUS_AREAS;
export type FocusAreasValue = typeof FOCUS_AREAS[FocusAreasKey];
