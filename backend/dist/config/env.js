"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env file
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
function getEnvVar(key, defaultValue) {
    const value = process.env[key] || defaultValue;
    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
function getEnvNumber(key, defaultValue) {
    const value = process.env[key];
    if (value === undefined)
        return defaultValue;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new Error(`Environment variable ${key} must be a number`);
    }
    return parsed;
}
exports.env = {
    // Server
    PORT: getEnvNumber('PORT', 3001),
    NODE_ENV: process.env.NODE_ENV || 'development',
    // Supabase
    SUPABASE_URL: getEnvVar('SUPABASE_URL'),
    SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
    // CORS
    FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:3000'),
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
    // File Upload
    MAX_FILE_SIZE_MB: getEnvNumber('MAX_FILE_SIZE_MB', 10),
    ALLOWED_FILE_TYPES: getEnvVar('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/webp,application/pdf').split(','),
};
exports.default = exports.env;
//# sourceMappingURL=env.js.map