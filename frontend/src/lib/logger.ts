/**
 * Safe logging utility that prevents sensitive data leaks in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Sanitizes objects to remove sensitive fields before logging
 */
function sanitize(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveKeys = [
    'password',
    'token',
    'access_token',
    'api_key',
    'secret',
    'authorization',
    'cookie',
    'session',
  ];

  if (Array.isArray(data)) {
    return data.map(sanitize);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  /**
   * Log informational messages (development only)
   */
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      if (data) {
        console.log(`[INFO] ${message}`, sanitize(data));
      } else {
        console.log(`[INFO] ${message}`);
      }
    }
  },

  /**
   * Log errors (always logged, but data is sanitized)
   */
  error: (message: string, error?: Error | unknown, data?: any) => {
    const errorName = error instanceof Error ? error.name : 'Unknown';
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`[ERROR] ${message}`, {
      name: errorName,
      message: errorMessage,
      ...(data ? { data: sanitize(data) } : {}),
    });

    // In production, you might want to send errors to a service like Sentry
    // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    //   Sentry.captureException(error, { extra: { message, data } });
    // }
  },

  /**
   * Log warnings (development only)
   */
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      if (data) {
        console.warn(`[WARN] ${message}`, sanitize(data));
      } else {
        console.warn(`[WARN] ${message}`);
      }
    }
  },

  /**
   * Log debug information (development only)
   */
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      if (data) {
        console.debug(`[DEBUG] ${message}`, sanitize(data));
      } else {
        console.debug(`[DEBUG] ${message}`);
      }
    }
  },
};
