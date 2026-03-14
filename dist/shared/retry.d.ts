export interface RetryOptions {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    retryableCheck?: (error: unknown) => boolean;
}
export declare function withRetry<T>(fn: () => Promise<T>, label: string, options?: Partial<RetryOptions>): Promise<T>;
//# sourceMappingURL=retry.d.ts.map