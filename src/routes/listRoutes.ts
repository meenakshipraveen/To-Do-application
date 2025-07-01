import { Router } from 'express';
import * as listController from '../controllers/listController';
import * as taskController from '../controllers/taskController';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Express router for task list endpoints
 * Defines all routes related to task list management and nested task operations
 */

const router = Router();

/**
 * GET /api/lists/health
 * Health check endpoint for task list service
 * Must be defined before the /:id route to avoid conflicts
 */
router.get('/health', asyncHandler(listController.healthCheck));

/**
 * GET /api/lists
 * Retrieves all task lists
 */
router.get('/', asyncHandler(listController.getAllTaskLists));

/**
 * POST /api/lists
 * Creates a new task list
 */
router.post('/', asyncHandler(listController.createTaskList));

/**
 * GET /api/lists/:id
 * Retrieves a specific task list by ID
 */
router.get('/:id', asyncHandler(listController.getTaskListById));

/**
 * PUT /api/lists/:id
 * Updates an existing task list
 */
router.put('/:id', asyncHandler(listController.updateTaskList));

/**
 * DELETE /api/lists/:id
 * Deletes a task list and all its associated tasks
 */
router.delete('/:id', asyncHandler(listController.deleteTaskList));

/**
 * GET /api/lists/:id/stats
 * Retrieves statistics for a specific task list
 */
router.get('/:id/stats', asyncHandler(listController.getTaskListStats));

/**
 * NESTED TASK ROUTES - List-specific task operations
 * These routes handle tasks within the context of a specific list
 */

/**
 * GET /api/lists/:listId/tasks
 * Retrieves all tasks for a specific task list
 */
router.get('/:listId/tasks', asyncHandler(taskController.getTasksByListId));

/**
 * POST /api/lists/:listId/tasks
 * Creates a new task in a specific task list
 */
router.post('/:listId/tasks', asyncHandler(taskController.createTask));

export default router;
