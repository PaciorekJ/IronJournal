export const ACCESSORY_EQUIPMENT = {
    WEIGHT_LIFTING_BELT: "weight lifting belt",
    WRIST_WRAPS: "wrist wraps",
    KNEE_SLEEVES: "knee sleeves",
    ELBOW_SLEEVES: "elbow sleeves",
    LIFTING_STRAPS: "lifting straps",
    BENCH_SHIRT: "bench shirt",
    RESISTANCE_BANDS: "resistance bands",
    CHAIN_WEIGHTS: "chain weights",
    ARM_BLASTERS: "arm blasters",

    WEIGHT_VEST: "weight vest",
    ANKLE_WEIGHTS: "ankle weights",
} as const;

export type AccessoryEquipmentKey = keyof typeof ACCESSORY_EQUIPMENT;
