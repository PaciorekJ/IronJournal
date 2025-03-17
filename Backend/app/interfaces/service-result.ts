export interface ILeveling {
    newLevel: number;
    remainingXp: number;

    streak: {
        currentStreak: number;
        xpMultiplier: number;
        nextMilestone: number | null;
        progressToNext: number;
    };
}

export interface ServiceResult<T = any> {
    data?: T; // Optional data for successful responses
    hasMore?: boolean; // Optional flag indicating if there are more results
    error?: string; // Optional error message for error responses
    leveling?: ILeveling;
    [key: string]: any; // Additional properties (flexible to accommodate any additional fields)
}
