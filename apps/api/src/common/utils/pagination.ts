export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function paginate(options: PaginationOptions): { skip: number; take: number } {
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  options: PaginationOptions,
): PaginatedResult<T> {
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));
  const totalPages = Math.ceil(total / pageSize);

  return {
    success: true,
    data: {
      items,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
