import type { AppError } from './errors.js';
export type Result<T, E = AppError> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare function ok<T>(value: T): Result<T, never>;
export declare function err<E>(error: E): Result<never, E>;
//# sourceMappingURL=result.d.ts.map