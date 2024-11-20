export const WEIGHT_SELECTION_METHOD = {
    REPS_IN_RESERVE: "RIR", // Reps in Reserve (RIR)
    RATE_OF_PERCEIVED_EXERTION: "RPE", // Rate of Perceived Exertion (RPE)
    PERCENTAGE_OF_1RM: "1RM", // Percentage of One Rep Max (1RM)
} as const;

export type WeightSelectionMethodKey = keyof typeof WEIGHT_SELECTION_METHOD;
