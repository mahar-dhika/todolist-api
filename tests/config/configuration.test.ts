/**
 * Configuration Integration Test
 * 
 * This test verifies that the configuration module works correctly
 * across different environments and validates all configuration settings.
 */

describe('Configuration Management', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        // Reset environment variables and clear module cache before each test
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        // Restore original environment variables
        process.env = originalEnv;
    });

    describe('App Configuration', () => {
        it('should load default development configuration', () => {
            process.env.NODE_ENV = 'development';

            const { config } = require('../../src/config/app.config');

            expect(config.server.env).toBe('development');
            expect(config.server.port).toBe(3000);
            expect(config.database.type).toBe('memory');
            expect(config.logging.level).toBe('debug');
            expect(config.swagger.enabled).toBe(true);
        });

        it('should load production configuration', () => {
            process.env.NODE_ENV = 'production';
            process.env.PORT = '8080';
            process.env.DATABASE_TYPE = 'oracle';
            process.env.DB_CONNECTION_STRING = 'oracle://test:test@localhost:1521/testdb';
            process.env.DB_USER = 'testuser';
            process.env.DB_PASSWORD = 'testpass';
            process.env.CORS_ORIGIN = 'https://example.com';

            const { config } = require('../../src/config/app.config');

            expect(config.server.env).toBe('production');
            expect(config.server.port).toBe(8080);
            expect(config.database.type).toBe('oracle');
        });

        it('should load test configuration', () => {
            process.env.NODE_ENV = 'test';

            const { config } = require('../../src/config/app.config');

            expect(config.server.env).toBe('test');
            expect(config.server.port).toBe(0);
            expect(config.database.type).toBe('memory');
            expect(config.logging.level).toBe('error');
            expect(config.swagger.enabled).toBe(false);
        });

        it('should validate development configuration correctly', () => {
            process.env.NODE_ENV = 'development';
            process.env.PORT = '3000';

            const { validateConfig } = require('../../src/config/app.config');

            expect(() => validateConfig()).not.toThrow();
        });

        it('should fail validation for missing production environment variables', () => {
            process.env.NODE_ENV = 'production';
            // Don't set required production variables

            const { validateConfig } = require('../../src/config/app.config');

            expect(() => validateConfig()).toThrow('Missing required environment variables');
        });

        it('should provide environment detection functions', () => {
            process.env.NODE_ENV = 'development';

            const { isDevelopment, isProduction, isTest } = require('../../src/config/app.config');

            expect(isDevelopment()).toBe(true);
            expect(isProduction()).toBe(false);
            expect(isTest()).toBe(false);
        });

        it('should provide configuration getters', () => {
            const {
                getDatabaseConfig,
                getCorsConfig,
                getRateLimitConfig,
                getLoggingConfig,
                getSecurityConfig
            } = require('../../src/config/app.config');

            const dbConfig = getDatabaseConfig();
            const corsConfig = getCorsConfig();
            const rateLimitConfig = getRateLimitConfig();
            const loggingConfig = getLoggingConfig();
            const securityConfig = getSecurityConfig();

            expect(dbConfig).toBeDefined();
            expect(corsConfig).toBeDefined();
            expect(rateLimitConfig).toBeDefined();
            expect(loggingConfig).toBeDefined();
            expect(securityConfig).toBeDefined();
        });
    });

    describe('Database Configuration', () => {
        it('should return memory database configuration for development', () => {
            process.env.NODE_ENV = 'development';
            process.env.DATABASE_TYPE = 'memory';

            const { getCurrentDatabaseConfig } = require('../../src/config/database.config');
            const dbConfig = getCurrentDatabaseConfig();

            expect(dbConfig.type).toBe('memory');
            expect(dbConfig.config).toBeDefined();
        });

        it('should return Oracle database configuration for production', () => {
            process.env.NODE_ENV = 'production';
            process.env.DATABASE_TYPE = 'oracle';
            process.env.DB_CONNECTION_STRING = 'oracle://test:test@localhost:1521/testdb';
            process.env.DB_USER = 'testuser';
            process.env.DB_PASSWORD = 'testpass';

            const { getCurrentDatabaseConfig } = require('../../src/config/database.config');
            const dbConfig = getCurrentDatabaseConfig();

            expect(dbConfig.type).toBe('oracle');
            expect(dbConfig.config).toBeDefined();
        });

        it('should get memory configuration', () => {
            const { getMemoryConfig } = require('../../src/config/database.config');
            const memConfig = getMemoryConfig();

            expect(memConfig.persistToDisk).toBe(false);
            expect(memConfig.autoSave).toBe(true);
            expect(memConfig.autoSaveInterval).toBe(30000);
        });

        it('should get Oracle configuration with valid environment', () => {
            process.env.DATABASE_TYPE = 'oracle';
            process.env.DB_CONNECTION_STRING = 'oracle://test:test@localhost:1521/testdb';
            process.env.DB_USER = 'testuser';
            process.env.DB_PASSWORD = 'testpass';

            const { getOracleConfig } = require('../../src/config/database.config');
            const oracleConfig = getOracleConfig();

            expect(oracleConfig.connectionString).toBe('oracle://test:test@localhost:1521/testdb');
            expect(oracleConfig.user).toBe('testuser');
            expect(oracleConfig.password).toBe('testpass');
            expect(oracleConfig.poolMin).toBe(5);
            expect(oracleConfig.poolMax).toBe(20);
        });

        it('should validate memory database configuration', () => {
            process.env.NODE_ENV = 'development';
            process.env.DATABASE_TYPE = 'memory';

            const { validateDatabaseConfig } = require('../../src/config/database.config');

            expect(() => validateDatabaseConfig()).not.toThrow();
        });

        it('should fail validation for missing Oracle credentials', () => {
            process.env.DATABASE_TYPE = 'oracle';
            // Clear Oracle-specific environment variables
            delete process.env.DB_CONNECTION_STRING;
            delete process.env.DB_USER;
            delete process.env.DB_PASSWORD;

            const { validateDatabaseConfig } = require('../../src/config/database.config');

            expect(() => validateDatabaseConfig()).toThrow('Oracle connection string is required');
        });

        it('should get migration configuration', () => {
            const { getMigrationConfig } = require('../../src/config/database.config');
            const migrationConfig = getMigrationConfig();

            expect(migrationConfig.enabled).toBe(true);
            expect(migrationConfig.directory).toBe('migrations');
            expect(migrationConfig.tableName).toBe('schema_migrations');
        });

        it('should get retry configuration', () => {
            const { getRetryConfig } = require('../../src/config/database.config');
            const retryConfig = getRetryConfig();

            expect(retryConfig.maxAttempts).toBe(5);
            expect(retryConfig.initialDelay).toBe(1000);
            expect(retryConfig.maxDelay).toBe(30000);
        });

        it('should check production database status', () => {
            process.env.NODE_ENV = 'development';
            process.env.DATABASE_TYPE = 'memory';

            const { isProductionDatabase } = require('../../src/config/database.config');

            expect(isProductionDatabase()).toBe(false);
        });

        it('should check transaction support', () => {
            process.env.DATABASE_TYPE = 'memory';

            const { supportsTransactions } = require('../../src/config/database.config');

            expect(supportsTransactions()).toBe(false);
        });

        it('should get connection timeout', () => {
            const { getConnectionTimeout } = require('../../src/config/database.config');
            const timeout = getConnectionTimeout();

            expect(timeout).toBe(5000); // Memory database timeout
        });
    });

    describe('Environment Variable Parsing', () => {
        it('should parse integer environment variables', () => {
            process.env.NODE_ENV = 'development';
            process.env.PORT = '8080';
            process.env.RATE_LIMIT_MAX = '200';

            const { config } = require('../../src/config/app.config');

            expect(config.server.port).toBe(8080);
            expect(config.rateLimit.maxRequests).toBe(200);
        });

        it('should parse boolean environment variables', () => {
            process.env.NODE_ENV = 'development';
            process.env.CORS_CREDENTIALS = 'true';
            process.env.TRUST_PROXY = 'true';

            const { config } = require('../../src/config/app.config');

            expect(config.cors.credentials).toBe(true);
            expect(config.security.trustProxy).toBe(true);
        });

        it('should handle missing environment variables with defaults', () => {
            process.env.NODE_ENV = 'development';
            // Clear specific environment variables
            delete process.env.PORT;
            delete process.env.HOST;

            const { config } = require('../../src/config/app.config');

            expect(config.server.port).toBe(3000);
            expect(config.server.host).toBe('localhost');
            expect(config.server.env).toBe('development');
        });

        it('should handle environment-specific overrides', () => {
            process.env.NODE_ENV = 'production';
            process.env.PORT = '8080';
            process.env.DATABASE_TYPE = 'oracle';
            process.env.DB_CONNECTION_STRING = 'oracle://test:test@localhost:1521/testdb';
            process.env.DB_USER = 'testuser';
            process.env.DB_PASSWORD = 'testpass';
            process.env.CORS_ORIGIN = 'https://example.com';

            const { config } = require('../../src/config/app.config');

            expect(config.server.env).toBe('production');
            expect(config.server.port).toBe(8080);
            expect(config.database.type).toBe('oracle');
            expect(config.logging.level).toBe('warn'); // Production default is 'warn'
        });
    });
});
