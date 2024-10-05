export const SET_TYPE = {
    SET_PROTOTYPE_STRAIGHT_SET: "SetPrototypeStraightSet",
    SET_PROTOTYPE_DROP_SET: "SetPrototypeDropSet",
    SET_PROTOTYPE_SUPER_SET: "SetPrototypeSuperset",
} as const;

export type SetTypeKey = keyof typeof SET_TYPE;
