import { Task } from './Task';

/**
 * TaskList interface representing a collection of tasks
 * Contains metadata for organizing and managing groups of tasks
 */
export interface TaskList {
  /** Unique identifier for the task list */
  id: string;
  
  /** Display name for the task list (e.g., "Work", "Personal", "Shopping") */
  name: string;
  
  /** Timestamp when the task list was created */
  createdAt: Date;
  
  /** Timestamp when the task list was last updated */
  updatedAt: Date;
}

/**
 * Data Transfer Object for creating a new task list
 * Contains only the fields required from the client
 */
export interface CreateTaskListDTO {
  name: string;
}

/**
 * Data Transfer Object for updating an existing task list
 * All fields are optional to allow partial updates
 */
export interface UpdateTaskListDTO {
  name?: string;
}

/**
 * Complete data structure for JSON storage
 * Contains all task lists and their associated tasks
 */
export interface StorageData {
  /** Array of all task lists */
  taskLists: TaskList[];
  
  /** Array of all tasks across all lists */
  tasks: Task[];
  
  /** Metadata about the storage file */
  metadata: {
    version: string;
    lastUpdated: Date;
  };
}
