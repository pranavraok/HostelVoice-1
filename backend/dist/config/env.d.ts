interface EnvConfig {
    PORT: number;
    NODE_ENV: 'development' | 'production' | 'test';
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    FRONTEND_URL: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    MAX_FILE_SIZE_MB: number;
    ALLOWED_FILE_TYPES: string[];
}
export declare const env: EnvConfig;
export default env;
//# sourceMappingURL=env.d.ts.map