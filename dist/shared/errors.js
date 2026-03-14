export class AppError extends Error {
    code;
    statusCode;
    cause;
    constructor(code, message, statusCode, cause) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.cause = cause;
        this.name = 'AppError';
    }
}
export class ExternalApiError extends AppError {
    source;
    constructor(source, message, statusCode, cause) {
        super(`EXTERNAL_API_${source.toUpperCase()}`, message, statusCode, cause);
        this.source = source;
        this.name = 'ExternalApiError';
    }
}
export class ValidationError extends AppError {
    constructor(message) {
        super('VALIDATION_ERROR', message, 400);
        this.name = 'ValidationError';
    }
}
//# sourceMappingURL=errors.js.map