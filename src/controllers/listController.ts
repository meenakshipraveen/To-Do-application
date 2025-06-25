import { Request, Response, NextFunction } from 'express';
import * as listService from '../services/listService';
import { validateCreateTaskList, validateUpdateTaskList, validateUUID } from '../utils/validation';
import { Logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

/**
 * Controller layer for task list operations
 * Handles HTTP requests and responses for task list management
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
 * GET /api/lists
 * Retrieves all task lists
 */
export async function getAllTaskLists(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    Logger.info('GET /api/lists - Retrieving all task lists');
    
    const taskLists = await listService.getAllTaskLists();
    
    const response = createSuccessResponse(taskLists, 'Task lists retrieved successfully');
    res.status(200).json(response);
    
    Logger.info('Successfully returned all task lists', { count: taskLists.length });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/lists/:id
 * Retrieves a specific task list by ID
 */
export async function getTaskListById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    Logger.info('GET /api/lists/:id - Retrieving task list by ID', { id });
    
    // Validate ID format
    const idValidation = validateUUID(id, 'id');
    if (!idValidation.isValid) {
      throw new AppError(idValidation.error!, 400);
    }
    
    const taskList = await listService.getTaskListById(id);
    
    if (!taskList) {
      throw new AppError('Task list not found', 404);
    }
    
    const response = createSuccessResponse(taskList, 'Task list retrieved successfully');
    res.status(200).json(response);
    
    Logger.info('Successfully returned task list', { id, name: taskList.name });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/lists
 * Creates a new task list
 */
export async function createTaskList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    Logger.info('POST /api/lists - Creating new task list', req.body);
    
    // Validate request body
    const validation = validateCreateTaskList(req.body);
    if (!validation.isValid) {
      throw new AppError(validation.error!, 422);
    }
    
    const newTaskList = await listService.createTaskList(req.body);
    
    const response = createSuccessResponse(newTaskList, 'Task list created successfully');
    res.status(201).json(response);
    
    Logger.info('Successfully created task list', { 
      id: newTaskList.id, 
      name: newTaskList.name 
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/lists/:id
 * Updates an existing task list
 */
export async function updateTaskList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    Logger.info('PUT /api/lists/:id - Updating task list', { id, body: req.body });
    
    // Validate ID format
    const idValidation = validateUUID(id, 'id');
    if (!idValidation.isValid) {
      throw new AppError(idValidation.error!, 400);
    }
    
    // Validate request body
    const validation = validateUpdateTaskList(req.body);
    if (!validation.isValid) {
      throw new AppError(validation.error!, 422);
    }
    
    const updatedTaskList = await listService.updateTaskList(id, req.body);
    
    if (!updatedTaskList) {
      throw new AppError('Task list not found', 404);
    }
    
    const response = createSuccessResponse(updatedTaskList, 'Task list updated successfully');
    res.status(200).json(response);
    
    Logger.info('Successfully updated task list', { 
      id: updatedTaskList.id, 
      name: updatedTaskList.name 
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/lists/:id
 * Deletes a task list and all its associated tasks
 */
export async function deleteTaskList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    Logger.info('DELETE /api/lists/:id - Deleting task list', { id });
    
    // Validate ID format
    const idValidation = validateUUID(id, 'id');
    if (!idValidation.isValid) {
      throw new AppError(idValidation.error!, 400);
    }
    
    const deleted = await listService.deleteTaskList(id);
    
    if (!deleted) {
      throw new AppError('Task list not found', 404);
    }
    
    const response = createSuccessResponse(
      { deleted: true }, 
      'Task list and all associated tasks deleted successfully'
    );
    res.status(200).json(response);
    
    Logger.info('Successfully deleted task list', { id });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/lists/:id/stats
 * Retrieves statistics for a specific task list
 */
export async function getTaskListStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    Logger.info('GET /api/lists/:id/stats - Getting task list statistics', { id });
    
    // Validate ID format
    const idValidation = validateUUID(id, 'id');
    if (!idValidation.isValid) {
      throw new AppError(idValidation.error!, 400);
    }
    
    const stats = await listService.getTaskListStats(id);
    
    if (!stats) {
      throw new AppError('Task list not found', 404);
    }
    
    const response = createSuccessResponse(stats, 'Task list statistics retrieved successfully');
    res.status(200).json(response);
    
    Logger.info('Successfully returned task list statistics', { id, stats });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/lists/health
 * Health check endpoint for task list service
 */
export async function healthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    Logger.info('GET /api/lists/health - Health check');
    
    // Perform a simple operation to verify service health
    const taskLists = await listService.getAllTaskLists();
    
    const response = createSuccessResponse(
      { 
        status: 'healthy',
        taskListsCount: taskLists.length,
        timestamp: new Date().toISOString()
      }, 
      'Task list service is healthy'
    );
    
    res.status(200).json(response);
    
    Logger.info('Health check passed', { taskListsCount: taskLists.length });
  } catch (error) {
    Logger.error('Health check failed', error);
    
    const response = {
      success: false,
      error: {
        message: 'Task list service is unhealthy',
        code: 'SERVICE_UNHEALTHY'
      },
      timestamp: new Date().toISOString()
    };
    
    res.status(503).json(response);
  }
}
