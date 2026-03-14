export declare class AppError extends Error {
    readonly code: string;
    readonly statusCode?: number | undefined;
    readonly cause?: unknown | undefined;
    constructor(code: string, message: string, statusCode?: number | undefined, cause?: unknown | undefined);
}
export declare class ExternalApiError extends AppError {
    readonly source: 'asaas' | 'airtable' | 'evolution';
    constructor(source: 'asaas' | 'airtable' | 'evolution', message: string, statusCode?: number, cause?: unknown);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map