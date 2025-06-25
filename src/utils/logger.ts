/**
 * Simple logging utility for the application
 * Provides structured logging with different levels and timestamps
 */

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

/**
 * Logger class for structured application logging
 * Uses console.log with formatted output including timestamps and log levels
 */
export class Logger {
  private static formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      return `${baseMessage} ${JSON.stringify(data, null, 2)}`;
    }
    
    return baseMessage;
  }

  /**
   * Log an informational message
   * @param message - The message to log
   * @param data - Optional additional data to include
   */
  static info(message: string, data?: any): void {
    console.log(this.formatMessage(LogLevel.INFO, message, data));
  }

  /**
   * Log a warning message
   * @param message - The warning message to log
   * @param data - Optional additional data to include
   */
  static warn(message: string, data?: any): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, data));
  }

  /**
   * Log an error message
   * @param message - The error message to log
   * @param data - Optional additional data to include (typically error objects)
   */
  static error(message: string, data?: any): void {
    console.error(this.formatMessage(LogLevel.ERROR, message, data));
  }

  /**
   * Log a debug message
   * @param message - The debug message to log
   * @param data - Optional additional data to include
   */
  static debug(message: string, data?: any): void {
    console.log(this.formatMessage(LogLevel.DEBUG, message, data));
  }

  /**
   * Log HTTP request information
   * @param method - HTTP method
   * @param url - Request URL
   * @param statusCode - Response status code
   * @param duration - Request duration in milliseconds
   */
  static request(method: string, url: string, statusCode: number, duration: number): void {
    const message = `${method} ${url} - ${statusCode} (${duration}ms)`;
    this.info(message);
  }

  /**
   * Log service operation information
   * @param service - Name of the service
   * @param operation - Operation being performed
   * @param data - Optional data related to the operation
   */
  static service(service: string, operation: string, data?: any): void {
    const message = `[${service}] ${operation}`;
    this.info(message, data);
  }
}
