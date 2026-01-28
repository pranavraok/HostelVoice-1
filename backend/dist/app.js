"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
const errorHandler_1 = require("./middleware/errorHandler");
// Import routes
const issues_routes_1 = __importDefault(require("./routes/issues.routes"));
const announcements_routes_1 = __importDefault(require("./routes/announcements.routes"));
const lostfound_routes_1 = __importDefault(require("./routes/lostfound.routes"));
const residents_routes_1 = __importDefault(require("./routes/residents.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: config_1.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.env.RATE_LIMIT_WINDOW_MS,
    max: config_1.env.RATE_LIMIT_MAX_REQUESTS,
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Request logging
if (config_1.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
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
        environment: config_1.env.NODE_ENV,
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
app.use('/api/issues', issues_routes_1.default);
app.use('/api/announcements', announcements_routes_1.default);
app.use('/api/lostfound', lostfound_routes_1.default);
app.use('/api/residents', residents_routes_1.default);
app.use('/api/notifications', notifications_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
// 404 handler
app.use(errorHandler_1.notFoundHandler);
// Global error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map