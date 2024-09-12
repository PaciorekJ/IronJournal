
export const MUSCLE_GROUPS = {
    ABDOMINALS: 'abdominals',
    BICEPS: 'biceps',
    TRICEPS: 'triceps',
    DELTOIDS: 'deltoids',
    ERECTOR_SPINAE: 'erector spinae',
    GLUTES: 'glutes',
    HAMSTRINGS: 'hamstrings',
    LATS: 'lats',
    OBLIQUES: 'obliques',
    PECTORALS: 'pectorals',
    QUADRICEPS: 'quadriceps',
    TRAPEZIUS: 'trapezius',
    CALVES: 'calves',
    FOREARMS: 'forearms',
    LOWER_BACK: 'lower back',
    MIDDLE_BACK: 'middle back',
    SHOULDERS: 'shoulders',
} as const;
  
export type MuscleGroupKey = keyof typeof MUSCLE_GROUPS;
export type MuscleGroupValue = typeof MUSCLE_GROUPS[MuscleGroupKey];
  