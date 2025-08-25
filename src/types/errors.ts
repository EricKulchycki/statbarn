// Base error interface
export interface AppError {
  message: string
  code: string
  statusCode?: number
  details?: Record<string, string | number | boolean | object | null>
}

// Specific error types
export interface ValidationError extends AppError {
  code: 'VALIDATION_ERROR'
  field: string
  value: string | number | boolean | object | null
}

export interface DatabaseError extends AppError {
  code: 'DATABASE_ERROR'
  operation: string
  collection?: string
}

export interface ApiError extends AppError {
  code: 'API_ERROR'
  endpoint: string
  response?: string | object
}

export interface NotFoundError extends AppError {
  code: 'NOT_FOUND'
  resource: string
  identifier: string
}

// Error factory functions
export const createValidationError = (
  field: string,
  value: string | number | boolean | object | null,
  message: string
): ValidationError => ({
  message,
  code: 'VALIDATION_ERROR',
  field,
  value,
  statusCode: 400,
})

export const createDatabaseError = (
  operation: string,
  message: string,
  collection?: string
): DatabaseError => ({
  message,
  code: 'DATABASE_ERROR',
  operation,
  collection,
  statusCode: 500,
})

export const createApiError = (
  endpoint: string,
  message: string,
  response?: string | object
): ApiError => ({
  message,
  code: 'API_ERROR',
  endpoint,
  response,
  statusCode: 500,
})

export const createNotFoundError = (
  resource: string,
  identifier: string
): NotFoundError => ({
  message: `${resource} with identifier '${identifier}' not found`,
  code: 'NOT_FOUND',
  resource,
  identifier,
  statusCode: 404,
})
