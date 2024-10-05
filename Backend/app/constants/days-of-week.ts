export const DAYS_OF_WEEK = {
    MONDAY: "monday",
    TUESDAY: "tuesday",
    WEDNESDAY: "wednesday",
    THURSDAY: "thursday",
    FRIDAY: "friday",
    SATURDAY: "saturday",
    SUNDAY: "sunday",
} as const;

export type DaysOfWeekKey = keyof typeof DAYS_OF_WEEK;