import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

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
  console.error('[API Error]', error); // Good practice to log the actual error

  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
  }

  if (error instanceof ZodError) {
    return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
  }

  if (error instanceof Error) {
    // Handle MongoDB duplicate key error
    if ((error as any).code === 11000) {
      return NextResponse.json({ error: 'Resource already exists' }, { status: 409 });
    }
  }
  
  // Default to 500 Internal Server Error
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
