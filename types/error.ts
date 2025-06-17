export type ErrorCode =
  | 'AUTHENTICATION_FAILED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'DUPLICATE_ENTRY'
  | 'INVALID_OPERATION'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: string;
  field?: string;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ErrorState {
  currentError: AppError | null;
  validationErrors: ValidationError[];
  isError: boolean;
} 