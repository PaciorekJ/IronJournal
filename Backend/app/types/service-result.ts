export interface ServiceResult<T = any> {
    status: number;               // HTTP status code (e.g., 200, 400, 404, 500)
    data?: T;                     // Optional data for successful responses
    error?: string;               // Optional error message for error responses
    [key: string]: any;           // Additional properties (flexible to accommodate any additional fields)
}
  