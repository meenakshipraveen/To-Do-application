/**
 * Task interface representing a single task item
 * Contains all properties needed for task management including
 * identification, content, timing, completion status, and metadata
 */
export interface Task {
  /** Unique identifier for the task */
  id: string;
  
  /** The main content/description of the task */
  title: string;
  
  /** Optional time field for scheduling or time tracking */
  time?: string;
  
  /** Boolean flag indicating if the task is completed */
  completed: boolean;
  
  /** Reference to the parent task list this task belongs to */
  listId: string;
  
  /** Timestamp when the task was created */
  createdAt: Date;
  
  /** Timestamp when the task was last updated */
  updatedAt: Date;
}

/**
 * Data Transfer Object for creating a new task
 * Contains only the fields required from the client
 */
export interface CreateTaskDTO {
  title: string;
  time?: string;
  listId: string;
}

/**
 * Data Transfer Object for updating an existing task
 * All fields are optional to allow partial updates
 */
export interface UpdateTaskDTO {
  title?: string;
  time?: string;
  completed?: boolean;
}
