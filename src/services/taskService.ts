import { v4 as uuidv4 } from 'uuid';
import { Task, CreateTaskDTO, UpdateTaskDTO } from '../models/Task';
import { readData, writeData } from '../utils/fileStorage';
import { Logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { taskListExists } from './listService';

/**
 * Service layer for task operations
 * Handles business logic for creating, reading, updating, and deleting tasks
 */

/**
 * Retrieves all tasks for a specific task list
 * @param listId - The task list ID
 * @returns Promise resolving to array of tasks
 */
export async function getTasksByListId(listId: string): Promise<Task[]> {
  try {
    Logger.service('TaskService', 'Getting tasks by list ID', { listId });
    
    // Verify that the task list exists
    const listExists = await taskListExists(listId);
    if (!listExists) {
      throw new AppError('Task list not found', 404);
    }
    
    const data = await readData();
    const tasks = data.tasks.filter(task => task.listId === listId);
    
    // Sort tasks by creation date (newest first)
    tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    Logger.service('TaskService', 'Successfully retrieved tasks', {
      listId,
      count: tasks.length
    });
    
    return tasks;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    Logger.error('Error getting tasks by list ID', { listId, error });
    throw new AppError('Failed to retrieve tasks', 500);
  }
}

/**
 * Retrieves a specific task by ID
 * @param id - The task ID
 * @returns Promise resolving to the task or null if not found
 */
export async function getTaskById(id: string): Promise<Task | null> {
  try {
    Logger.service('TaskService', 'Getting task by ID', { id });
    
    const data = await readData();
    const task = data.tasks.find(task => task.id === id);
    
    if (!task) {
      Logger.service('TaskService', 'Task not found', { id });
      return null;
    }
    
    Logger.service('TaskService', 'Successfully retrieved task', {
      id,
      title: task.title,
      listId: task.listId
    });
    
    return task;
  } catch (error) {
    Logger.error('Error getting task by ID', { id, error });
    throw new AppError('Failed to retrieve task', 500);
  }
}

/**
 * Creates a new task
 * @param createData - Data for creating the task
 * @returns Promise resolving to the created task
 */
export async function createTask(createData: CreateTaskDTO): Promise<Task> {
  try {
    Logger.service('TaskService', 'Creating new task', createData);
    
    // Verify that the task list exists
    const listExists = await taskListExists(createData.listId);
    if (!listExists) {
      throw new AppError('Task list not found', 404);
    }
    
    const data = await readData();
    
    // Create new task
    const newTask: Task = {
      id: uuidv4(),
      title: createData.title.trim(),
      time: createData.time?.trim(),
      completed: false,
      listId: createData.listId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to storage
    data.tasks.push(newTask);
    await writeData(data);
    
    Logger.service('TaskService', 'Successfully created task', {
      id: newTask.id,
      title: newTask.title,
      listId: newTask.listId
    });
    
    return newTask;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    Logger.error('Error creating task', { createData, error });
    throw new AppError('Failed to create task', 500);
  }
}

/**
 * Updates an existing task
 * @param id - The task ID
 * @param updateData - Data for updating the task
 * @returns Promise resolving to the updated task or null if not found
 */
export async function updateTask(
  id: string,
  updateData: UpdateTaskDTO
): Promise<Task | null> {
  try {
    Logger.service('TaskService', 'Updating task', { id, updateData });
    
    const data = await readData();
    const taskIndex = data.tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      Logger.service('TaskService', 'Task not found for update', { id });
      return null;
    }
    
    // Update the task
    const currentTask = data.tasks[taskIndex];
    const updatedTask: Task = {
      ...currentTask,
      ...(updateData.title !== undefined && { title: updateData.title.trim() }),
      ...(updateData.time !== undefined && { time: updateData.time?.trim() }),
      ...(updateData.completed !== undefined && { completed: updateData.completed }),
      updatedAt: new Date()
    };
    
    data.tasks[taskIndex] = updatedTask;
    await writeData(data);
    
    Logger.service('TaskService', 'Successfully updated task', {
      id: updatedTask.id,
      title: updatedTask.title,
      completed: updatedTask.completed
    });
    
    return updatedTask;
  } catch (error) {
    Logger.error('Error updating task', { id, updateData, error });
    throw new AppError('Failed to update task', 500);
  }
}

/**
 * Toggles the completion status of a task
 * @param id - The task ID
 * @returns Promise resolving to the updated task or null if not found
 */
export async function toggleTaskCompletion(id: string): Promise<Task | null> {
  try {
    Logger.service('TaskService', 'Toggling task completion', { id });
    
    const data = await readData();
    const taskIndex = data.tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      Logger.service('TaskService', 'Task not found for toggle', { id });
      return null;
    }
    
    // Toggle completion status
    const currentTask = data.tasks[taskIndex];
    const updatedTask: Task = {
      ...currentTask,
      completed: !currentTask.completed,
      updatedAt: new Date()
    };
    
    data.tasks[taskIndex] = updatedTask;
    await writeData(data);
    
    Logger.service('TaskService', 'Successfully toggled task completion', {
      id: updatedTask.id,
      title: updatedTask.title,
      completed: updatedTask.completed
    });
    
    return updatedTask;
  } catch (error) {
    Logger.error('Error toggling task completion', { id, error });
    throw new AppError('Failed to toggle task completion', 500);
  }
}

/**
 * Deletes a task
 * @param id - The task ID
 * @returns Promise resolving to boolean indicating success
 */
export async function deleteTask(id: string): Promise<boolean> {
  try {
    Logger.service('TaskService', 'Deleting task', { id });
    
    const data = await readData();
    const taskIndex = data.tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      Logger.service('TaskService', 'Task not found for deletion', { id });
      return false;
    }
    
    // Remove the task
    const deletedTask = data.tasks[taskIndex];
    data.tasks.splice(taskIndex, 1);
    
    await writeData(data);
    
    Logger.service('TaskService', 'Successfully deleted task', {
      id,
      title: deletedTask.title,
      listId: deletedTask.listId
    });
    
    return true;
  } catch (error) {
    Logger.error('Error deleting task', { id, error });
    throw new AppError('Failed to delete task', 500);
  }
}

/**
 * Gets all tasks across all lists (for admin/overview purposes)
 * @returns Promise resolving to array of all tasks
 */
export async function getAllTasks(): Promise<Task[]> {
  try {
    Logger.service('TaskService', 'Getting all tasks');
    
    const data = await readData();
    
    // Sort tasks by creation date (newest first)
    const tasks = [...data.tasks].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    Logger.service('TaskService', 'Successfully retrieved all tasks', {
      count: tasks.length
    });
    
    return tasks;
  } catch (error) {
    Logger.error('Error getting all tasks', error);
    throw new AppError('Failed to retrieve all tasks', 500);
  }
}

/**
 * Searches tasks by title across all lists or within a specific list
 * @param query - Search query string
 * @param listId - Optional list ID to limit search scope
 * @returns Promise resolving to array of matching tasks
 */
export async function searchTasks(query: string, listId?: string): Promise<Task[]> {
  try {
    Logger.service('TaskService', 'Searching tasks', { query, listId });
    
    const data = await readData();
    let tasks = data.tasks;
    
    // Filter by list if specified
    if (listId) {
      const listExists = await taskListExists(listId);
      if (!listExists) {
        throw new AppError('Task list not found', 404);
      }
      tasks = tasks.filter(task => task.listId === listId);
    }
    
    // Search by title (case-insensitive)
    const searchQuery = query.toLowerCase().trim();
    const matchingTasks = tasks.filter(task =>
      task.title.toLowerCase().includes(searchQuery)
    );
    
    // Sort by relevance (exact matches first, then partial matches)
    matchingTasks.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      // Exact matches first
      if (aTitle === searchQuery && bTitle !== searchQuery) return -1;
      if (bTitle === searchQuery && aTitle !== searchQuery) return 1;
      
      // Then by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    Logger.service('TaskService', 'Successfully searched tasks', {
      query,
      listId,
      matchCount: matchingTasks.length
    });
    
    return matchingTasks;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    Logger.error('Error searching tasks', { query, listId, error });
    throw new AppError('Failed to search tasks', 500);
  }
}

/**
 * Gets task statistics for a specific list or all lists
 * @param listId - Optional list ID to get stats for specific list
 * @returns Promise resolving to statistics object
 */
export async function getTaskStats(listId?: string): Promise<{
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
}> {
  try {
    Logger.service('TaskService', 'Getting task statistics', { listId });
    
    const data = await readData();
    let tasks = data.tasks;
    
    // Filter by list if specified
    if (listId) {
      const listExists = await taskListExists(listId);
      if (!listExists) {
        throw new AppError('Task list not found', 404);
      }
      tasks = tasks.filter(task => task.listId === listId);
    }
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const stats = {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate: Math.round(completionRate * 100) / 100 // Round to 2 decimal places
    };
    
    Logger.service('TaskService', 'Successfully calculated task statistics', {
      listId,
      stats
    });
    
    return stats;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    Logger.error('Error getting task statistics', { listId, error });
    throw new AppError('Failed to get task statistics', 500);
  }
}
