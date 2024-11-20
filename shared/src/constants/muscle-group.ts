export const MUSCLE_GROUP = {
    ABDOMINALS: "abdominals",
    NECK: "neck",
    ADDUCTORS: "adductors",
    ABDUCTORS: "abductors",
    BICEPS: "biceps",
    TRICEPS: "triceps",
    DELTOIDS: "deltoids",
    ERECTOR_SPINAE: "erector spinae",
    GLUTES: "glutes",
    HAMSTRINGS: "hamstrings",
    LATISSIMUS_DORSI: "latissimus dorsi",
    OBLIQUES: "obliques",
    PECTORALS: "pectorals",
    QUADRICEPS: "quadriceps",
    TRAPEZIUS: "trapezius",
    CALVES: "calves",
    FOREARMS: "forearms",
    LOWER_BACK: "lower back",
    MIDDLE_BACK: "middle back",
} as const;

export type MuscleGroupKey = keyof typeof MUSCLE_GROUP;
