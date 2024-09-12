export const SCHEDULE_TYPE = {
    CYCLE: 'cycle',
    FIXED_DAYS: 'fixed-days',
} as const;

export type ScheduleTypeKey = keyof typeof SCHEDULE_TYPE;
export type ScheduleTypeValue = typeof SCHEDULE_TYPE[ScheduleTypeKey];
