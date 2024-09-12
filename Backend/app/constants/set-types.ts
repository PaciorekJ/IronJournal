
export const SET_TYPES = {
    STRAIGHT_SET: 'SetPrototypeStraightSet',
    DROP_SET: 'SetPrototypeDropSet',
    SUPER_SET: 'SetPrototypeSuperset',
} as const;
  
export type SetTypeKey = keyof typeof SET_TYPES;
export type SetTypeValue = typeof SET_TYPES[SetTypeKey];
  