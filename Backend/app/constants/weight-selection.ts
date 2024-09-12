export const WEIGHT_SELECTION_METHOD = {
    REPS_IN_RESERVE: 'REPS_IN_RESERVE',                       // Reps in Reserve (RIR)
    RATE_OF_PERCEIVED_EXERTION: 'RATE_OF_PERCEIVED_EXERTION', // Rate of Perceived Exertion (RPE)
    PERCENTAGE_OF_1RM: 'PERCENTAGE_OF_1RM',                   // Percentage of One Rep Max (1RM)
} as const;
  
export type WeightSelectionMethodKey = keyof typeof WEIGHT_SELECTION_METHOD;
export type WeightSelectionMethodValue = typeof WEIGHT_SELECTION_METHOD[WeightSelectionMethodKey];
  