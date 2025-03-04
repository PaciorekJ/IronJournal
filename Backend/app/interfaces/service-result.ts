export interface ILeveling {
    oldLevel: number;
    newLevel: number;
    oldXp: number;
    newXP: number;
    xpEarned: number;
    leveledUp: boolean;
    message?: string;
}

export interface ServiceResult<T = any> {
    data?: T; // Optional data for successful responses
    hasMore?: boolean; // Optional flag indicating if there are more results
    error?: string; // Optional error message for error responses
    leveling?: ILeveling;
    [key: string]: any; // Additional properties (flexible to accommodate any additional fields)
}
