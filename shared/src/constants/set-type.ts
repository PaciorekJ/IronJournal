export const SET_TYPE = {
    SET_PROTOTYPE_STRAIGHT_SET: "SET_PROTOTYPE_STRAIGHT_SET",
    SET_PROTOTYPE_DROP_SET: "SET_PROTOTYPE_DROP_SET",
    SET_PROTOTYPE_SUPER_SET: "SET_PROTOTYPE_SUPER_SET",
    SET_PROTOTYPE_PYRAMID_SET: "SET_PROTOTYPE_PYRAMID_SET",
    SET_PROTOTYPE_CIRCUIT_SET: "SET_PROTOTYPE_CIRCUIT_SET",
    SET_PROTOTYPE_ISOMETRIC_SET: "SET_PROTOTYPE_ISOMETRIC_SET",
    SET_PROTOTYPE_AMRAP_SET: "SET_PROTOTYPE_AMRAP_SET",
} as const;

export type SetTypeKey = keyof typeof SET_TYPE;

/**
 * TODO: Refine Schemas And Added schemas for other set types. Make sure to find the method that maintains a smaller document size as these will be added to workouts
 * Assume Optional Rest Time Between sets if set is a multi-set set, unless explicitly stated otherwise
 * Assume Optional Tempo for entire set, unless explicitly stated otherwise
 * Assume Optional WeightSelection for entire set, unless explicitly stated otherwise.
 * Assume Fixed Exercise for entire set, unless explicitly stated otherwise
 * Assume No rest specified unless it's a multi-set or explicitly states otherwise
 *
 * Straight Sets (Fixed weight and Reps)
 * Drop Sets (Multi-set, No Reps specified, but load reduction after each set is specified, No rest between sets, Sets Initial weight selection and load reductions)
 * Superset (Multi-set, Allows multiple exercises, can use any Of these sets)
 * Rest-Pause Sets (Multi-set, Fixed weight, Required rest between sets)
 * Pyramid Sets (Multi-set, Either increase weight or reps)
 * Reverse Pyramid Sets (Multi-set, Either decrease weight or reps) | Use Pyramid Sets but enforce it different in the schema
 * Non-Linear Pyramid Sets (Multi-set, Either increase/decrease weight or reps) | Use Pyramid Sets but enforce it different in the schema
 * Isometric Set, Require Time frame in seconds, No Tempo
 * AMRAP Set, Optional time frame in seconds
 */
