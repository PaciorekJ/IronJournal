export const SET_TYPES = {
    BASE: 'SetPrototype',
    DROP: 'SetPrototypeDrop',
    SUPERSET: 'SetPrototypeSuperset',
} as const;

export type SetTypeKey = keyof typeof SET_TYPES;
export type SetTypeValue = typeof SET_TYPES[SetTypeKey];