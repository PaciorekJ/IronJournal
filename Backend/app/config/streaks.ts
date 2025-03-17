export interface IStreakconfig {
    streakResetDays: number;
    streakMultiplier: {
        [key: number]: number;
    };
}

export const StreakConfig: IStreakconfig = {
    streakResetDays: 2, // How many days of inactivity before the streak resets
    streakMultiplier: {
        0: 1.0, // Normal XP (no streak)
        7: 1.05, // 10% XP boost after 7-day streak
        14: 1.1, // 15% XP boost after 14-day streak
        30: 1.2, // 20% XP boost after 30-day streak
        60: 1.3, // 30% XP boost after 60-day streak
        90: 1.35, // 40% XP boost after 90-day streak
        180: 1.5, // 45% XP boost after 180-day streak
        365: 2, // 200% XP boost after 365-day streak
    },
} as const;
