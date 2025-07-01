import express from 'express';
import { corsMiddleware } from './src/config/cors';
import { initializeStorage } from './src/config/database';
import { errorHandler, notFoundHandler, requestLogger } from './src/middleware/errorHandler';
import listRoutes from './src/routes/listRoutes';
import taskRoutes from './src/routes/taskRoutes';
import { Logger } from './src/utils/logger';

/**
 * Express application setup and configuration
 * Main entry point for the To-Do List API server
 */

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Global middleware setup
 */

// Request logging middleware
app.use(requestLogger);

// CORS middleware
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for frontend
app.use(express.static('public'));

/**
 * API Routes
 */

// Task list routes
app.use('/api/lists', listRoutes);

// Task routes
app.use('/api/tasks', taskRoutes);

/**
 * Health check endpoint for the entire application
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'To-Do List API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    message: 'API is running successfully'
  });
});

/**
 * Root endpoint - API information
 */
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'To-Do List API',
      version: '1.0.0',
      description: 'A full-stack to-do list application with multiple task lists support',
      endpoints: {
        lists: '/api/lists',
        tasks: '/api/tasks',
        health: '/api/health'
      },
      documentation: {
        lists: {
          'GET /api/lists': 'Get all task lists',
          'POST /api/lists': 'Create a new task list',
          'GET /api/lists/:id': 'Get a specific task list',
          'PUT /api/lists/:id': 'Update a task list',
          'DELETE /api/lists/:id': 'Delete a task list',
          'GET /api/lists/:id/stats': 'Get task list statistics',
          'GET /api/lists/:listId/tasks': 'Get tasks for a specific list',
          'POST /api/lists/:listId/tasks': 'Create a task in a specific list'
        },
        tasks: {
          'GET /api/tasks': 'Get all tasks',
          'GET /api/tasks/:id': 'Get a specific task',
          'PUT /api/tasks/:id': 'Update a task',
          'DELETE /api/tasks/:id': 'Delete a task',
          'PATCH /api/tasks/:id/toggle': 'Toggle task completion',
          'GET /api/tasks/search?q=query&listId=id': 'Search tasks',
          'GET /api/tasks/stats?listId=id': 'Get task statistics'
        }
      }
    },
    message: 'Welcome to the To-Do List API'
  });
});

/**
 * Serve the frontend HTML file for the root route
 */
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

/**
 * Error handling middleware
 */

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

/**
 * Server startup function
 */
async function startServer(): Promise<void> {
  try {
    // Initialize storage system
    await initializeStorage();
    Logger.info('Storage system initialized successfully');

    // Start the server
    app.listen(PORT, () => {
      Logger.info(`🚀 To-Do List API server started successfully`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
      
      Logger.info(`📋 API Documentation available at: http://localhost:${PORT}/api`);
      Logger.info(`🌐 Frontend available at: http://localhost:${PORT}`);
      Logger.info(`❤️  Health check available at: http://localhost:${PORT}/api/health`);
    });

  } catch (error) {
    Logger.error('Failed to start server', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handling
 */
process.on('SIGTERM', () => {
  Logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  Logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Rejection at:', { promise, reason });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  Logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  startServer();
}

export default app;
