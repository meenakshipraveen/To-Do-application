import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/taskService';
import { validateCreateTask, validateUpdateTask, validateUUID } from '../utils/validation';
import { Logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

/**
 * Controller layer for task operations
 * Handles HTTP requests and responses for task management
 */

/**
 * Standard success response interface
 */
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Creates a standardized success response
 * @param data - Response data
 * @param message - Optional success message
 * @returns Formatted success response object
 */
function createSuccessResponse<T>(data: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString()
  };
}

/**
 * GET /api/lists/:listId/tasks
 * Retrieves all tasks for a specific task list
 */
export async function getTasksByListId(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { listId } = req.params;
    
    Logger.info('GET /api/lists/:listId/tasks - Retrieving tasks by list ID', { listId });
    
    // Validate listId format
    const idValidation = validateUUID(listId, 'listId');
    if (!idValidation.isValid) {
      throw new AppError(idValidation.error!, 400);
    }
    
    const tasks = await taskService.getTasksByListId(listId);
    
    const response = createSuccessResponse(tasks, 'Tasks retrieved successfully');
    res.status(200).json(response);
    
    Logger.info('Successfully returned tasks for list', { listId, count: tasks.length });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tasks/:id
 * Retrieves a specific task by ID
 */
export async function getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    Logger.info('GET /api/tasks/:id - Retrieving task by ID', { id });
    
    // Validate ID format
    const idValidation = validateUUID(id, 'id');
    if (!idValidation.isValid) {
      throw new AppError(idValidation.error!, 400);
    }
    
    const task = await taskService.getTaskById(id);
    
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    
    const response = createSuccessResponse(task, 'Task retrieved successfully');
    res.status(200).json(response);
    
    Logger.info('Successfully returned task', { id, title: task.title });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/lists/:listId/tasks
 * Creates a new task in a specific task list
 */
export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { listId } = req.params;
    
    Logger.info('POST /api/lists/:listId/tasks - Creating new task', { listId, body: req.body });
    
    // Validate listId format
    const idValidation = validateUUID(listId, 'listId');
    if (!idValidation.isValid) {
      throw new AppError(idValidation.error!, 400);
    }
    
    // Add listId to request body for validation
    const taskData = { ...req.body, listId };
    
    // Validate request body
    const validation = validateCreateTask(taskData);
    if (!validation.isValid) {
      throw new AppError(validation.error!, 422);
    }
    
    const newTask = await taskService.createTask(taskData);
    
    const response = createSuccessResponse(newTask, 'Task created successfully');
    res.status(201).json(response);
    
    Logger.info('Successfully created task', { 
      id: newTask.id, 
      title: newTask.title,
      listId: newTask.listId
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/tasks/:id
 * Updates an existing task
 */
export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    Logger.info('PUT /api/tasks/:id - Updating task', { id, body: req.body });
    
    // Validate ID format
    const idValidation = validateUUID(id, 'id');
    if (!idValidation.isValid) {
      throw new AppError(idValidation.error!, 400);
    }
    
    // Validate request body
    const validation = validateUpdateTask(req.body);
    if (!validation.isValid) {
      throw new AppError(validation.error!, 422);
    }
    
    const updatedTask = await taskService.updateTask(id, req.body);
    
    if (!updatedTask) {
      throw new AppError('Task not found', 404);
    }
    
    const response = createSuccessResponse(updatedTask, 'Task updated successfully');
    res.status(200).json(response);
    
    Logger.info('Successfully updated task', { 
      id: updatedTask.id, 
      title: updatedTask.title,
      completed: updatedTask.completed
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/tasks/:id/toggle
 * Toggles the completion status of a task
 */
export async function toggleTaskCompletion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    Logger.info('PATCH /api/tasks/:id/toggle - Toggling task completion', { id });
    
    // Validate ID format
    const idValidation = validateUUID(id, 'id');
    if (!idValidation.isValid) {
      throw new AppError(idValidation.error!, 400);
    }
    
    const updatedTask = await taskService.toggleTaskCompletion(id);
    
    if (!updatedTask) {
      throw new AppError('Task not found', 404);
    }
    
    const response = createSuccessResponse(
      updatedTask, 
      `Task marked as ${updatedTask.completed ? 'completed' : 'pending'}`
    );
    res.status(200).json(response);
    
    Logger.info('Successfully toggled task completion', { 
      id: updatedTask.id, 
      title: updatedTask.title,
      completed: updatedTask.completed
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/tasks/:id
 * Deletes a task
 */
export async function deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    Logger.info('DELETE /api/tasks/:id - Deleting task', { id });
    
    // Validate ID format
    const idValidation = validateUUID(id, 'id');
    if (!idValidation.isValid) {
      throw new AppError(idValidation.error!, 400);
    }
    
    const deleted = await taskService.deleteTask(id);
    
    if (!deleted) {
      throw new AppError('Task not found', 404);
    }
    
    const response = createSuccessResponse(
      { deleted: true }, 
      'Task deleted successfully'
    );
    res.status(200).json(response);
    
    Logger.info('Successfully deleted task', { id });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tasks
 * Retrieves all tasks across all lists (for admin/overview purposes)
 */
export async function getAllTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    Logger.info('GET /api/tasks - Retrieving all tasks');
    
    const tasks = await taskService.getAllTasks();
    
    const response = createSuccessResponse(tasks, 'All tasks retrieved successfully');
    res.status(200).json(response);
    
    Logger.info('Successfully returned all tasks', { count: tasks.length });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tasks/search
 * Searches tasks by title across all lists or within a specific list
 */
export async function searchTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { q: query, listId } = req.query;
    
    Logger.info('GET /api/tasks/search - Searching tasks', { query, listId });
    
    // Validate query parameter
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new AppError('Search query is required and cannot be empty', 400);
    }
    
    // Validate listId if provided
    if (listId) {
      if (typeof listId !== 'string') {
        throw new AppError('listId must be a string', 400);
      }
      
      const idValidation = validateUUID(listId, 'listId');
      if (!idValidation.isValid) {
        throw new AppError(idValidation.error!, 400);
      }
    }
    
    const tasks = await taskService.searchTasks(query, listId as string | undefined);
    
    const response = createSuccessResponse(
      tasks, 
      `Found ${tasks.length} task(s) matching "${query}"`
    );
    res.status(200).json(response);
    
    Logger.info('Successfully searched tasks', { 
      query, 
      listId, 
      matchCount: tasks.length 
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tasks/stats
 * Gets task statistics for all lists or a specific list
 */
export async function getTaskStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { listId } = req.query;
    
    Logger.info('GET /api/tasks/stats - Getting task statistics', { listId });
    
    // Validate listId if provided
    if (listId) {
      if (typeof listId !== 'string') {
        throw new AppError('listId must be a string', 400);
      }
      
      const idValidation = validateUUID(listId, 'listId');
      if (!idValidation.isValid) {
        throw new AppError(idValidation.error!, 400);
      }
    }
    
    const stats = await taskService.getTaskStats(listId as string | undefined);
    
    const response = createSuccessResponse(
      stats, 
      listId ? 'Task list statistics retrieved successfully' : 'Overall task statistics retrieved successfully'
    );
    res.status(200).json(response);
    
    Logger.info('Successfully returned task statistics', { listId, stats });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tasks/health
 * Health check endpoint for task service
 */
export async function healthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    Logger.info('GET /api/tasks/health - Health check');
    
    // Perform a simple operation to verify service health
    const tasks = await taskService.getAllTasks();
    
    const response = createSuccessResponse(
      { 
        status: 'healthy',
        tasksCount: tasks.length,
        timestamp: new Date().toISOString()
      }, 
      'Task service is healthy'
    );
    
    res.status(200).json(response);
    
    Logger.info('Health check passed', { tasksCount: tasks.length });
  } catch (error) {
    Logger.error('Health check failed', error);
    
    const response = {
      success: false,
      error: {
        message: 'Task service is unhealthy',
        code: 'SERVICE_UNHEALTHY'
      },
      timestamp: new Date().toISOString()
    };
    
    res.status(503).json(response);
  }
}
