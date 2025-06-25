import { isStorageAccessible } from '../utils/fileStorage';
import { Logger } from '../utils/logger';

/**
 * Database configuration and initialization
 * Handles JSON file storage setup and health checks
 */

/**
 * Initializes the storage system
 * Checks if storage is accessible and creates initial structure if needed
 * @returns Promise that resolves when storage is ready
 */
export async function initializeStorage(): Promise<void> {
  try {
    Logger.info('Initializing storage system...');
    
    const isAccessible = await isStorageAccessible();
    
    if (!isAccessible) {
      throw new Error('Storage system is not accessible');
    }
    
    Logger.info('Storage system initialized successfully');
  } catch (error) {
    Logger.error('Failed to initialize storage system', error);
    throw error;
  }
}

/**
 * Performs a health check on the storage system
 * @returns Promise resolving to boolean indicating storage health
 */
export async function checkStorageHealth(): Promise<boolean> {
  try {
    const isAccessible = await isStorageAccessible();
    
    if (isAccessible) {
      Logger.debug('Storage health check passed');
      return true;
    } else {
      Logger.warn('Storage health check failed');
      return false;
    }
  } catch (error) {
    Logger.error('Error during storage health check', error);
    return false;
  }
}

/**
 * Storage configuration constants
 */
export const STORAGE_CONFIG = {
  // Maximum file size in bytes (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  // Backup retention period in days
  BACKUP_RETENTION_DAYS: 7,
  
  // Auto-backup interval in milliseconds (1 hour)
  AUTO_BACKUP_INTERVAL: 60 * 60 * 1000,
  
  // Storage file encoding
  FILE_ENCODING: 'utf-8' as const,
  
  // JSON formatting options
  JSON_INDENT: 2
};
