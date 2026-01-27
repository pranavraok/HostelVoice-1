import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import issuesRoutes from './routes/issues.routes';
import announcementsRoutes from './routes/announcements.routes';
import lostFoundRoutes from './routes/lostfound.routes';
import residentsRoutes from './routes/residents.routes';
import notificationsRoutes from './routes/notifications.routes';
import analyticsRoutes from './routes/analytics.routes';
import adminRoutes from './routes/admin.routes';
import uploadRoutes from './routes/upload.routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Request logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HostelVoice API',
    version: '1.0.0',
    status: 'running',
    docs: '/docs',
    health: '/health',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HostelVoice API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API Documentation endpoint
app.get('/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HostelVoice Backend API Documentation',
    version: '1.0.0',
    documentation: 'See POSTMAN_TESTING_GUIDE.md or import HostelVoice_Backend_API.postman_collection.json',
    baseURL: 'http://localhost:3001/api',
    authentication: 'Bearer Token (Supabase JWT)',
    modules: {
      issues: {
        path: '/api/issues',
        methods: ['GET', 'POST', 'PATCH'],
        description: 'Issue tracking and management',
      },
      announcements: {
        path: '/api/announcements',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        description: 'System announcements and broadcasts',
      },
      lostfound: {
        path: '/api/lostfound',
        methods: ['GET', 'POST', 'PATCH'],
        description: 'Lost and found item management',
      },
      residents: {
        path: '/api/residents',
        methods: ['GET', 'POST', 'PATCH'],
        description: 'Resident information management',
      },
      notifications: {
        path: '/api/notifications',
        methods: ['GET', 'PATCH'],
        description: 'User notifications management',
      },
      analytics: {
        path: '/api/analytics',
        methods: ['GET'],
        description: 'Analytics and statistics',
      },
      admin: {
        path: '/api/admin',
        methods: ['GET', 'PATCH'],
        description: 'Admin functions and user management',
      },
      upload: {
        path: '/api/upload',
        methods: ['GET', 'POST', 'DELETE'],
        description: 'File upload and storage management',
      },
    },
    endpoints: {
      health: '/health',
      docs: '/docs',
      root: '/',
    },
    requiresAuth: 'All /api/* endpoints require Bearer token in Authorization header',
    links: {
      postmanCollection: './HostelVoice_Backend_API.postman_collection.json',
      testingGuide: './POSTMAN_TESTING_GUIDE.md',
      readme: './README.md',
    },
  });
});

// API Routes
app.use('/api/issues', issuesRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/lostfound', lostFoundRoutes);
app.use('/api/residents', residentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
