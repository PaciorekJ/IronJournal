// WARNING: Always keep keys and values the same

export const SET_TYPE = {
    STRAIGHT_SET: "STRAIGHT_SET",
    DROP_SET: "DROP_SET",
    SUPER_SET: "SUPER_SET",
    REST_PAUSE_SET: "REST_PAUSE_SET",
    PYRAMID_SET: "PYRAMID_SET",
    REVERSE_PYRAMID_SET: "REVERSE_PYRAMID_SET",
    NON_LINEAR_PYRAMID_SET: "NON_LINEAR_PYRAMID_SET",
    ISOMETRIC_SET: "ISOMETRIC_SET",
    CARDIO_SET: "CARDIO_SET",
    AMRAP_SET: "AMRAP_SET",
    REST_SET: "REST_SET",
} as const;

if (
    !Object.keys(SET_TYPE).every(
        (key) => SET_TYPE[key as keyof typeof SET_TYPE] === key,
    )
)
    throw new Error("SET_TYPE HAVE BEEN ADJUSTED IN A WAY NOT PERMITTED");

export type SetTypeKey = keyof typeof SET_TYPE;
