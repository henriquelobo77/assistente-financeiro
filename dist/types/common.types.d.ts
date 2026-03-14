export interface PaginationParams {
    offset: number;
    limit: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    totalCount: number;
    hasMore: boolean;
}
export interface DateRange {
    startDate: string;
    endDate: string;
}
//# sourceMappingURL=common.types.d.ts.map