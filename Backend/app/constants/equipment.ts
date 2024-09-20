export const EQUIPMENT = {
    BODY_ONLY: "body only",
    MACHINE: "machine",
    DUMBBELL: "dumbbell",
    BARBELL: "barbell",
    KETTLEBELLS: "kettlebells",
    BANDS: "bands",
    MEDICINE_BALL: "medicine ball",
    EXERCISE_BALL: "exercise ball",
    CABLE: "cable",
    FOAM_ROLL: "foam roll",
    OTHER: "other",
} as const;

export type EquipmentKey = keyof typeof EQUIPMENT;
export type EquipmentValue = (typeof EQUIPMENT)[EquipmentKey];
