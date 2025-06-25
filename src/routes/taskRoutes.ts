import { Router } from 'express';
import * as taskController from '../controllers/taskController';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Express router for task endpoints
 * Defines all routes related to task management
 */

const router = Router();

/**
 * GET /api/tasks/health
 * Health check endpoint for task service
 * Must be defined before other routes to avoid conflicts
 */
router.get('/health', asyncHandler(taskController.healthCheck));

/**
 * GET /api/tasks/search
 * Searches tasks by title across all lists or within a specific list
 * Must be defined before /:id route to avoid conflicts
 */
router.get('/search', asyncHandler(taskController.searchTasks));

/**
 * GET /api/tasks/stats
 * Gets task statistics for all lists or a specific list
 * Must be defined before /:id route to avoid conflicts
 */
router.get('/stats', asyncHandler(taskController.getTaskStats));

/**
 * GET /api/tasks
 * Retrieves all tasks across all lists (for admin/overview purposes)
 */
router.get('/', asyncHandler(taskController.getAllTasks));

/**
 * GET /api/tasks/:id
 * Retrieves a specific task by ID
 */
router.get('/:id', asyncHandler(taskController.getTaskById));

/**
 * PUT /api/tasks/:id
 * Updates an existing task
 */
router.put('/:id', asyncHandler(taskController.updateTask));

/**
 * DELETE /api/tasks/:id
 * Deletes a task
 */
router.delete('/:id', asyncHandler(taskController.deleteTask));

/**
 * PATCH /api/tasks/:id/toggle
 * Toggles the completion status of a task
 */
router.patch('/:id/toggle', asyncHandler(taskController.toggleTaskCompletion));

/**
 * GET /api/lists/:listId/tasks
 * Retrieves all tasks for a specific task list
 * This route is mounted on the main router, not this task router
 */

/**
 * POST /api/lists/:listId/tasks
 * Creates a new task in a specific task list
 * This route is mounted on the main router, not this task router
 */

export default router;
