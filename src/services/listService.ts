import { v4 as uuidv4 } from 'uuid';
import { TaskList, CreateTaskListDTO, UpdateTaskListDTO } from '../models/TaskList';
import { readData, writeData } from '../utils/fileStorage';
import { Logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

/**
 * Service layer for task list operations
 * Handles business logic for creating, reading, updating, and deleting task lists
 */

/**
 * Retrieves all task lists from storage
 * @returns Promise resolving to array of task lists
 */
export async function getAllTaskLists(): Promise<TaskList[]> {
  try {
    Logger.service('ListService', 'Getting all task lists');
    
    const data = await readData();
    
    Logger.service('ListService', 'Successfully retrieved task lists', {
      count: data.taskLists.length
    });
    
    return data.taskLists;
  } catch (error) {
    Logger.error('Error getting all task lists', error);
    throw new AppError('Failed to retrieve task lists', 500);
  }
}

/**
 * Retrieves a specific task list by ID
 * @param id - The task list ID
 * @returns Promise resolving to the task list or null if not found
 */
export async function getTaskListById(id: string): Promise<TaskList | null> {
  try {
    Logger.service('ListService', 'Getting task list by ID', { id });
    
    const data = await readData();
    const taskList = data.taskLists.find(list => list.id === id);
    
    if (!taskList) {
      Logger.service('ListService', 'Task list not found', { id });
      return null;
    }
    
    Logger.service('ListService', 'Successfully retrieved task list', { id, name: taskList.name });
    return taskList;
  } catch (error) {
    Logger.error('Error getting task list by ID', { id, error });
    throw new AppError('Failed to retrieve task list', 500);
  }
}

/**
 * Creates a new task list
 * @param createData - Data for creating the task list
 * @returns Promise resolving to the created task list
 */
export async function createTaskList(createData: CreateTaskListDTO): Promise<TaskList> {
  try {
    Logger.service('ListService', 'Creating new task list', createData);
    
    const data = await readData();
    
    // Check if a task list with the same name already exists
    const existingList = data.taskLists.find(
      list => list.name.toLowerCase() === createData.name.toLowerCase()
    );
    
    if (existingList) {
      throw new AppError('A task list with this name already exists', 409);
    }
    
    // Create new task list
    const newTaskList: TaskList = {
      id: uuidv4(),
      name: createData.name.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to storage
    data.taskLists.push(newTaskList);
    await writeData(data);
    
    Logger.service('ListService', 'Successfully created task list', {
      id: newTaskList.id,
      name: newTaskList.name
    });
    
    return newTaskList;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    Logger.error('Error creating task list', { createData, error });
    throw new AppError('Failed to create task list', 500);
  }
}

/**
 * Updates an existing task list
 * @param id - The task list ID
 * @param updateData - Data for updating the task list
 * @returns Promise resolving to the updated task list or null if not found
 */
export async function updateTaskList(
  id: string,
  updateData: UpdateTaskListDTO
): Promise<TaskList | null> {
  try {
    Logger.service('ListService', 'Updating task list', { id, updateData });
    
    const data = await readData();
    const taskListIndex = data.taskLists.findIndex(list => list.id === id);
    
    if (taskListIndex === -1) {
      Logger.service('ListService', 'Task list not found for update', { id });
      return null;
    }
    
    // Check if new name conflicts with existing lists (excluding current list)
    if (updateData.name) {
      const existingList = data.taskLists.find(
        list => list.id !== id && list.name.toLowerCase() === updateData.name!.toLowerCase()
      );
      
      if (existingList) {
        throw new AppError('A task list with this name already exists', 409);
      }
    }
    
    // Update the task list
    const currentList = data.taskLists[taskListIndex];
    const updatedTaskList: TaskList = {
      ...currentList,
      ...(updateData.name && { name: updateData.name.trim() }),
      updatedAt: new Date()
    };
    
    data.taskLists[taskListIndex] = updatedTaskList;
    await writeData(data);
    
    Logger.service('ListService', 'Successfully updated task list', {
      id: updatedTaskList.id,
      name: updatedTaskList.name
    });
    
    return updatedTaskList;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    Logger.error('Error updating task list', { id, updateData, error });
    throw new AppError('Failed to update task list', 500);
  }
}

/**
 * Deletes a task list and all its associated tasks
 * @param id - The task list ID
 * @returns Promise resolving to boolean indicating success
 */
export async function deleteTaskList(id: string): Promise<boolean> {
  try {
    Logger.service('ListService', 'Deleting task list', { id });
    
    const data = await readData();
    const taskListIndex = data.taskLists.findIndex(list => list.id === id);
    
    if (taskListIndex === -1) {
      Logger.service('ListService', 'Task list not found for deletion', { id });
      return false;
    }
    
    // Remove the task list
    const deletedList = data.taskLists[taskListIndex];
    data.taskLists.splice(taskListIndex, 1);
    
    // Remove all tasks associated with this list
    const tasksToRemove = data.tasks.filter(task => task.listId === id);
    data.tasks = data.tasks.filter(task => task.listId !== id);
    
    await writeData(data);
    
    Logger.service('ListService', 'Successfully deleted task list', {
      id,
      name: deletedList.name,
      tasksRemoved: tasksToRemove.length
    });
    
    return true;
  } catch (error) {
    Logger.error('Error deleting task list', { id, error });
    throw new AppError('Failed to delete task list', 500);
  }
}

/**
 * Checks if a task list exists
 * @param id - The task list ID
 * @returns Promise resolving to boolean indicating existence
 */
export async function taskListExists(id: string): Promise<boolean> {
  try {
    const taskList = await getTaskListById(id);
    return taskList !== null;
  } catch (error) {
    Logger.error('Error checking task list existence', { id, error });
    return false;
  }
}

/**
 * Gets task list statistics
 * @param id - The task list ID
 * @returns Promise resolving to statistics object or null if list not found
 */
export async function getTaskListStats(id: string): Promise<{
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
} | null> {
  try {
    Logger.service('ListService', 'Getting task list statistics', { id });
    
    const data = await readData();
    const taskList = data.taskLists.find(list => list.id === id);
    
    if (!taskList) {
      return null;
    }
    
    const listTasks = data.tasks.filter(task => task.listId === id);
    const completedTasks = listTasks.filter(task => task.completed).length;
    const totalTasks = listTasks.length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const stats = {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate: Math.round(completionRate * 100) / 100 // Round to 2 decimal places
    };
    
    Logger.service('ListService', 'Successfully calculated task list statistics', {
      id,
      stats
    });
    
    return stats;
  } catch (error) {
    Logger.error('Error getting task list statistics', { id, error });
    throw new AppError('Failed to get task list statistics', 500);
  }
}
