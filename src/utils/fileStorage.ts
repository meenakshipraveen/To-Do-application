import * as fs from 'fs';
import * as path from 'path';
import { StorageData } from '../models/TaskList';
import { Logger } from './logger';

/**
 * File storage utility for JSON-based data persistence
 * Handles atomic file operations to prevent data corruption
 */

const STORAGE_FILE_PATH = path.join(process.cwd(), 'data', 'storage.json');
const BACKUP_FILE_PATH = path.join(process.cwd(), 'data', 'storage.backup.json');

/**
 * Ensures the data directory exists
 * Creates the directory if it doesn't exist
 */
function ensureDataDirectory(): void {
  const dataDir = path.dirname(STORAGE_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    Logger.info('Created data directory', { path: dataDir });
  }
}

/**
 * Creates initial storage data structure
 * @returns Default storage data with empty arrays and metadata
 */
function createInitialData(): StorageData {
  return {
    taskLists: [],
    tasks: [],
    metadata: {
      version: '1.0.0',
      lastUpdated: new Date()
    }
  };
}

/**
 * Reads data from the JSON storage file
 * Creates initial data if file doesn't exist
 * @returns Promise resolving to the storage data
 */
export async function readData(): Promise<StorageData> {
  try {
    ensureDataDirectory();
    
    // Check if storage file exists
    if (!fs.existsSync(STORAGE_FILE_PATH)) {
      Logger.info('Storage file not found, creating initial data');
      const initialData = createInitialData();
      await writeData(initialData);
      return initialData;
    }
    
    // Read and parse the storage file
    const fileContent = await fs.promises.readFile(STORAGE_FILE_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Convert date strings back to Date objects
    data.metadata.lastUpdated = new Date(data.metadata.lastUpdated);
    data.taskLists.forEach((list: any) => {
      list.createdAt = new Date(list.createdAt);
      list.updatedAt = new Date(list.updatedAt);
    });
    data.tasks.forEach((task: any) => {
      task.createdAt = new Date(task.createdAt);
      task.updatedAt = new Date(task.updatedAt);
    });
    
    Logger.debug('Successfully read storage data', { 
      taskListsCount: data.taskLists.length,
      tasksCount: data.tasks.length 
    });
    
    return data as StorageData;
  } catch (error) {
    Logger.error('Error reading storage data', error);
    
    // Try to read from backup file
    if (fs.existsSync(BACKUP_FILE_PATH)) {
      Logger.warn('Attempting to restore from backup file');
      try {
        const backupContent = await fs.promises.readFile(BACKUP_FILE_PATH, 'utf-8');
        const backupData = JSON.parse(backupContent);
        
        // Convert date strings back to Date objects
        backupData.metadata.lastUpdated = new Date(backupData.metadata.lastUpdated);
        backupData.taskLists.forEach((list: any) => {
          list.createdAt = new Date(list.createdAt);
          list.updatedAt = new Date(list.updatedAt);
        });
        backupData.tasks.forEach((task: any) => {
          task.createdAt = new Date(task.createdAt);
          task.updatedAt = new Date(task.updatedAt);
        });
        
        Logger.info('Successfully restored from backup file');
        return backupData as StorageData;
      } catch (backupError) {
        Logger.error('Error reading backup file', backupError);
      }
    }
    
    // If all else fails, return initial data
    Logger.warn('Creating fresh initial data due to read errors');
    return createInitialData();
  }
}

/**
 * Writes data to the JSON storage file with atomic operations
 * Creates a backup before writing to prevent data loss
 * @param data - The storage data to write
 * @returns Promise that resolves when write is complete
 */
export async function writeData(data: StorageData): Promise<void> {
  try {
    ensureDataDirectory();
    
    // Update metadata
    data.metadata.lastUpdated = new Date();
    
    // Create backup of existing file if it exists
    if (fs.existsSync(STORAGE_FILE_PATH)) {
      await fs.promises.copyFile(STORAGE_FILE_PATH, BACKUP_FILE_PATH);
      Logger.debug('Created backup of storage file');
    }
    
    // Write to temporary file first (atomic operation)
    const tempFilePath = `${STORAGE_FILE_PATH}.tmp`;
    const jsonContent = JSON.stringify(data, null, 2);
    
    await fs.promises.writeFile(tempFilePath, jsonContent, 'utf-8');
    
    // Atomically move temp file to final location
    await fs.promises.rename(tempFilePath, STORAGE_FILE_PATH);
    
    Logger.debug('Successfully wrote storage data', {
      taskListsCount: data.taskLists.length,
      tasksCount: data.tasks.length
    });
  } catch (error) {
    Logger.error('Error writing storage data', error);
    throw new Error('Failed to save data to storage');
  }
}

/**
 * Checks if the storage file exists and is readable
 * @returns Promise resolving to boolean indicating file accessibility
 */
export async function isStorageAccessible(): Promise<boolean> {
  try {
    ensureDataDirectory();
    
    if (!fs.existsSync(STORAGE_FILE_PATH)) {
      return true; // File doesn't exist but can be created
    }
    
    await fs.promises.access(STORAGE_FILE_PATH, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch (error) {
    Logger.error('Storage file is not accessible', error);
    return false;
  }
}

/**
 * Creates a manual backup of the current storage file
 * @returns Promise that resolves when backup is complete
 */
export async function createBackup(): Promise<void> {
  try {
    if (!fs.existsSync(STORAGE_FILE_PATH)) {
      Logger.warn('No storage file exists to backup');
      return;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(
      path.dirname(STORAGE_FILE_PATH),
      `storage.backup.${timestamp}.json`
    );
    
    await fs.promises.copyFile(STORAGE_FILE_PATH, backupPath);
    Logger.info('Manual backup created', { backupPath });
  } catch (error) {
    Logger.error('Error creating manual backup', error);
    throw new Error('Failed to create backup');
  }
}
