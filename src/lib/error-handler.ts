// Error handling utility to prevent information leakage

const ERROR_MESSAGES: Record<string, string> = {
  // PostgreSQL error codes
  '23505': 'This item already exists. Please use a different value.',
  '23503': 'Cannot complete operation due to related records.',
  '23514': 'The provided data does not meet requirements.',
  '42501': 'You do not have permission to perform this action.',
  '42P01': 'The requested resource was not found.',
  '22P02': 'Invalid data format provided.',
  
  // RLS errors
  'PGRST301': 'You do not have permission to access this resource.',
};

const ERROR_PATTERNS: Array<[RegExp, string]> = [
  [/violates row-level security/i, 'You do not have permission to access this resource.'],
  [/permission denied/i, 'You do not have permission to perform this action.'],
  [/violates foreign key/i, 'Cannot complete operation due to related records.'],
  [/duplicate key/i, 'This item already exists.'],
  [/unique constraint/i, 'This item already exists.'],
  [/not found/i, 'The requested resource was not found.'],
  [/violates check constraint/i, 'The provided data does not meet requirements.'],
];

export function getSafeErrorMessage(error: unknown): string {
  if (!error) {
    return 'An error occurred. Please try again.';
  }

  const errorObj = error as { code?: string; message?: string };
  
  // Check for known error codes
  if (errorObj?.code && ERROR_MESSAGES[errorObj.code]) {
    return ERROR_MESSAGES[errorObj.code];
  }
  
  // Check for error message patterns
  const errorMsg = errorObj?.message?.toLowerCase() || '';
  for (const [pattern, safeMessage] of ERROR_PATTERNS) {
    if (pattern.test(errorMsg)) {
      return safeMessage;
    }
  }
  
  // Default safe message
  return 'An error occurred. Please try again or contact support if the problem persists.';
}

export function getCategorizedError(error: unknown): {
  title: string;
  description: string;
} {
  const message = getSafeErrorMessage(error);
  const errorObj = error as { code?: string };
  
  if (errorObj?.code === '42501' || message.includes('permission')) {
    return {
      title: 'Access Denied',
      description: message
    };
  }
  
  if (errorObj?.code?.startsWith('23')) {
    return {
      title: 'Validation Error',
      description: message
    };
  }
  
  return {
    title: 'Error',
    description: message
  };
}
