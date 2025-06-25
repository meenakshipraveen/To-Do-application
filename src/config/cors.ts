import cors from 'cors';

/**
 * CORS configuration for the Express application
 * Allows cross-origin requests from the frontend
 */

const corsOptions: cors.CorsOptions = {
  // Allow requests from localhost during development
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    // Allow file:// protocol for local HTML files
    /^file:\/\//
  ],
  
  // Allow common HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // Allow common headers
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ],
  
  // Allow credentials if needed
  credentials: true,
  
  // Cache preflight requests for 24 hours
  maxAge: 86400
};

/**
 * Configured CORS middleware for Express
 */
export const corsMiddleware = cors(corsOptions);
