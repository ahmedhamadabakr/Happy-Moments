export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      status: error.statusCode,
      body: {
        error: error.message,
        code: error.code,
      },
    };
  }

  if (error instanceof Error) {
    // Handle Zod validation errors
    if (error.message.includes('Zod')) {
      return {
        status: 400,
        body: {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Handle MongoDB duplicate key error
    if (error.message.includes('E11000')) {
      return {
        status: 409,
        body: {
          error: 'Resource already exists',
          code: 'DUPLICATE_ENTRY',
        },
      };
    }

    return {
      status: 500,
      body: {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    };
  }

  return {
    status: 500,
    body: {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  };
}

export function createErrorResponse(statusCode: number, message: string, code?: string) {
  return {
    success: false,
    error: message,
    code: code || 'ERROR',
  };
}

export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
  };
}
