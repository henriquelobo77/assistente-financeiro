export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode?: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ExternalApiError extends AppError {
  constructor(
    public readonly source: 'asaas' | 'airtable' | 'evolution',
    message: string,
    statusCode?: number,
    cause?: unknown,
  ) {
    super(`EXTERNAL_API_${source.toUpperCase()}`, message, statusCode, cause);
    this.name = 'ExternalApiError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400);
    this.name = 'ValidationError';
  }
}
