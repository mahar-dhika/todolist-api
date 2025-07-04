/**
 * Application Configuration
 * 
 * This module contains all configuration settings for the To-Do List API
 * application including server, security, database, and middleware configurations.
 */

/**
 * Environment-specific configuration interface
 */
interface IEnvironmentConfig {
    server: {
        port: number;
        host: string;
        apiPrefix: string;
        env: string;
        shutdownTimeout: number;
    };
    database: {
        type: 'memory' | 'oracle';
        oracle?: {
            connectionString?: string;
            user?: string;
            password?: string;
            poolMin: number;
            poolMax: number;
            poolIncrement: number;
            poolTimeout: number;
            stmtCacheSize: number;
        };
    };
    cors: {
        origin: string | string[] | boolean;
        credentials: boolean;
        optionsSuccessStatus: number;
        methods: string[];
        allowedHeaders: string[];
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
        message: {
            error: string;
            success: boolean;
        };
        standardHeaders: boolean;
        legacyHeaders: boolean;
    };
    security: {
        trustProxy: boolean;
        contentSecurityPolicy: boolean;
        helmet: {
            enabled: boolean;
            options: any;
        };
    };
    request: {
        bodyLimit: string;
        parameterLimit: number;
        urlEncoded: {
            extended: boolean;
            limit: string;
        };
    };
    logging: {
        level: string;
        format: string;
        file: {
            enabled: boolean;
            filename: string;
            maxSize: string;
            maxFiles: number;
        };
        console: {
            enabled: boolean;
            colorize: boolean;
        };
    };
    swagger: {
        enabled: boolean;
        path: string;
        title: string;
        version: string;
        description: string;
    };
}

/**
 * Base configuration that applies to all environments
 */
const baseConfig: IEnvironmentConfig = {
    server: {
        port: parseInt(process.env.PORT || '3000', 10),
        host: process.env.HOST || 'localhost',
        apiPrefix: '/api',
        env: process.env.NODE_ENV || 'development',
        shutdownTimeout: parseInt(process.env.SHUTDOWN_TIMEOUT || '10000', 10)
    },

    database: {
        type: (process.env.DATABASE_TYPE as 'memory' | 'oracle') || 'memory',
        oracle: {
            connectionString: process.env.DB_CONNECTION_STRING || '',
            user: process.env.DB_USER || '',
            password: process.env.DB_PASSWORD || '',
            poolMin: parseInt(process.env.DB_POOL_MIN || '5', 10),
            poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10),
            poolIncrement: parseInt(process.env.DB_POOL_INCREMENT || '2', 10),
            poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT || '60', 10),
            stmtCacheSize: parseInt(process.env.DB_STMT_CACHE_SIZE || '30', 10)
        }
    },

    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: process.env.CORS_CREDENTIALS === 'true',
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
        message: {
            error: 'Too many requests from this IP, please try again later.',
            success: false
        },
        standardHeaders: true,
        legacyHeaders: false
    },

    security: {
        trustProxy: process.env.TRUST_PROXY === 'true',
        contentSecurityPolicy: process.env.NODE_ENV === 'production',
        helmet: {
            enabled: process.env.HELMET_ENABLED !== 'false',
            options: {
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ["'self'"],
                        styleSrc: ["'self'", "'unsafe-inline'"],
                        scriptSrc: ["'self'"],
                        objectSrc: ["'none'"],
                        upgradeInsecureRequests: [],
                    },
                },
            }
        }
    },

    request: {
        bodyLimit: process.env.REQUEST_BODY_LIMIT || '10mb',
        parameterLimit: parseInt(process.env.REQUEST_PARAM_LIMIT || '20', 10),
        urlEncoded: {
            extended: true,
            limit: process.env.REQUEST_BODY_LIMIT || '10mb'
        }
    },

    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined',
        file: {
            enabled: process.env.LOG_FILE_ENABLED === 'true',
            filename: process.env.LOG_FILE_NAME || 'logs/app.log',
            maxSize: process.env.LOG_FILE_MAX_SIZE || '10m',
            maxFiles: parseInt(process.env.LOG_FILE_MAX_FILES || '5', 10)
        },
        console: {
            enabled: process.env.LOG_CONSOLE_ENABLED !== 'false',
            colorize: process.env.LOG_CONSOLE_COLORIZE !== 'false'
        }
    },

    swagger: {
        enabled: process.env.SWAGGER_ENABLED !== 'false',
        path: process.env.SWAGGER_PATH || '/docs',
        title: 'To-Do List API',
        version: '1.0.0',
        description: 'A comprehensive To-Do List API with list and task management'
    }
};

/**
 * Development environment configuration
 */
const developmentConfig: Partial<IEnvironmentConfig> = {
    database: {
        type: 'memory'
    },
    cors: {
        ...baseConfig.cors,
        origin: true // Allow all origins in development
    },
    logging: {
        ...baseConfig.logging,
        level: 'debug',
        format: 'dev',
        file: {
            enabled: false,
            filename: 'logs/dev.log',
            maxSize: '5m',
            maxFiles: 3
        },
        console: {
            enabled: true,
            colorize: true
        }
    },
    security: {
        ...baseConfig.security,
        contentSecurityPolicy: false,
        helmet: {
            enabled: false,
            options: {}
        }
    }
};

/**
 * Production environment configuration
 */
const productionConfig: Partial<IEnvironmentConfig> = {
    database: {
        type: 'oracle'
    },
    cors: {
        ...baseConfig.cors,
        origin: process.env.CORS_ORIGIN?.split(',') || false
    },
    rateLimit: {
        ...baseConfig.rateLimit,
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100
    },
    logging: {
        ...baseConfig.logging,
        level: 'warn',
        format: 'combined',
        file: {
            enabled: true,
            filename: 'logs/production.log',
            maxSize: '20m',
            maxFiles: 10
        },
        console: {
            enabled: false,
            colorize: false
        }
    },
    security: {
        ...baseConfig.security,
        trustProxy: true,
        contentSecurityPolicy: true,
        helmet: {
            enabled: true,
            options: {
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ["'self'"],
                        styleSrc: ["'self'", "'unsafe-inline'"],
                        scriptSrc: ["'self'"],
                        objectSrc: ["'none'"],
                        upgradeInsecureRequests: [],
                    },
                },
                hsts: {
                    maxAge: 31536000,
                    includeSubDomains: true,
                    preload: true
                }
            }
        }
    }
};

/**
 * Test environment configuration
 */
const testConfig: Partial<IEnvironmentConfig> = {
    server: {
        ...baseConfig.server,
        port: 0, // Use random available port for testing
        shutdownTimeout: 1000
    },
    database: {
        type: 'memory'
    },
    rateLimit: {
        ...baseConfig.rateLimit,
        maxRequests: 1000 // Higher limit for testing
    },
    logging: {
        ...baseConfig.logging,
        level: 'error', // Minimal logging during tests
        format: 'dev',
        file: {
            enabled: false,
            filename: 'logs/test.log',
            maxSize: '1m',
            maxFiles: 1
        },
        console: {
            enabled: false,
            colorize: false
        }
    },
    swagger: {
        ...baseConfig.swagger,
        enabled: false
    }
};

/**
 * Get configuration based on environment
 */
function getEnvironmentConfig(): IEnvironmentConfig {
    const env = process.env.NODE_ENV || 'development';

    switch (env) {
        case 'production':
            return { ...baseConfig, ...productionConfig };
        case 'test':
            return { ...baseConfig, ...testConfig };
        case 'development':
        default:
            return { ...baseConfig, ...developmentConfig };
    }
}

/**
 * Application configuration object
 */
export const config = getEnvironmentConfig();

/**
 * Required environment variables per environment
 */
const requiredEnvVars: Record<string, string[]> = {
    development: [
        // No required vars for development
    ],
    test: [
        // No required vars for testing
    ],
    production: [
        'PORT',
        'NODE_ENV',
        'DB_CONNECTION_STRING',
        'DB_USER',
        'DB_PASSWORD',
        'CORS_ORIGIN'
    ]
};

/**
 * Validate required environment variables based on current environment
 */
export function validateConfig(): void {
    const env = process.env.NODE_ENV || 'development';
    const required = requiredEnvVars[env] || [];

    const missingVars = required.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables for ${env} environment: ${missingVars.join(', ')}`);
    }

    // Validate database configuration for Oracle
    if (config.database.type === 'oracle') {
        if (!config.database.oracle?.connectionString) {
            throw new Error('Oracle database connection string is required when database type is "oracle"');
        }
        if (!config.database.oracle?.user) {
            throw new Error('Oracle database user is required when database type is "oracle"');
        }
        if (!config.database.oracle?.password) {
            throw new Error('Oracle database password is required when database type is "oracle"');
        }
    }

    // Validate port number
    if (isNaN(config.server.port) || config.server.port < 1 || config.server.port > 65535) {
        throw new Error('Server port must be a valid number between 1 and 65535');
    }

    // Validate rate limit settings
    if (config.rateLimit.maxRequests < 1) {
        throw new Error('Rate limit max requests must be greater than 0');
    }

    if (config.rateLimit.windowMs < 1000) {
        throw new Error('Rate limit window must be at least 1000ms (1 second)');
    }
}

/**
 * Check if the application is running in development mode
 */
export const isDevelopment = (): boolean => config.server.env === 'development';

/**
 * Check if the application is running in production mode
 */
export const isProduction = (): boolean => config.server.env === 'production';

/**
 * Check if the application is running in test mode
 */
export const isTest = (): boolean => config.server.env === 'test';

/**
 * Get database configuration
 */
export const getDatabaseConfig = () => config.database;

/**
 * Get CORS configuration
 */
export const getCorsConfig = () => config.cors;

/**
 * Get rate limit configuration
 */
export const getRateLimitConfig = () => config.rateLimit;

/**
 * Get logging configuration
 */
export const getLoggingConfig = () => config.logging;

/**
 * Get security configuration
 */
export const getSecurityConfig = () => config.security;
