export const SCHEDULE_TYPE = {
    CYCLE: "cycle",
    WEEKLY: "weekly",
} as const;

export type ScheduleTypeKey = keyof typeof SCHEDULE_TYPE;