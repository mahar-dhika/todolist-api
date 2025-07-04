/**
 * Database Configuration
 * 
 * This module contains database-specific configuration settings for both
 * memory storage (development/testing) and Oracle database (production).
 */

import { config } from './app.config';

/**
 * Database connection interface
 */
export interface IDatabaseConnection {
    type: 'memory' | 'oracle';
    isConnected: boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    healthCheck(): Promise<boolean>;
}

/**
 * Oracle database configuration interface
 */
export interface IOracleConfig {
    connectionString: string;
    user: string;
    password: string;
    poolMin: number;
    poolMax: number;
    poolIncrement: number;
    poolTimeout: number;
    stmtCacheSize: number;
    autoCommit: boolean;
    maxRows: number;
    queueMax: number;
    queueTimeout: number;
    enableStatistics: boolean;
}

/**
 * Memory database configuration interface
 */
export interface IMemoryConfig {
    persistToDisk: boolean;
    dataFile?: string;
    autoSave: boolean;
    autoSaveInterval: number;
    compression: boolean;
}

/**
 * Get Oracle database configuration
 */
export function getOracleConfig(): IOracleConfig {
    // Check environment variables directly for Oracle config
    const connectionString = process.env.DB_CONNECTION_STRING || '';
    const user = process.env.DB_USER || '';
    const password = process.env.DB_PASSWORD || '';

    return {
        connectionString,
        user,
        password,
        poolMin: parseInt(process.env.DB_POOL_MIN || '5', 10),
        poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10),
        poolIncrement: parseInt(process.env.DB_POOL_INCREMENT || '2', 10),
        poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT || '60', 10),
        stmtCacheSize: parseInt(process.env.DB_STMT_CACHE_SIZE || '30', 10),
        autoCommit: process.env.DB_AUTO_COMMIT === 'true',
        maxRows: parseInt(process.env.DB_MAX_ROWS || '1000', 10),
        queueMax: parseInt(process.env.DB_QUEUE_MAX || '500', 10),
        queueTimeout: parseInt(process.env.DB_QUEUE_TIMEOUT || '60000', 10),
        enableStatistics: process.env.DB_ENABLE_STATISTICS === 'true'
    };
}

/**
 * Get memory database configuration
 */
export function getMemoryConfig(): IMemoryConfig {
    return {
        persistToDisk: process.env.MEMORY_DB_PERSIST === 'true',
        dataFile: process.env.MEMORY_DB_FILE || 'data/memory-db.json',
        autoSave: process.env.MEMORY_DB_AUTO_SAVE !== 'false',
        autoSaveInterval: parseInt(process.env.MEMORY_DB_AUTO_SAVE_INTERVAL || '30000', 10), // 30 seconds
        compression: process.env.MEMORY_DB_COMPRESSION === 'true'
    };
}

/**
 * Get current database configuration based on environment
 */
export function getCurrentDatabaseConfig() {
    // Check environment variables directly instead of relying on config object
    const databaseType = (process.env.DATABASE_TYPE as 'memory' | 'oracle') || 'memory';

    if (databaseType === 'oracle') {
        return {
            type: 'oracle' as const,
            config: getOracleConfig()
        };
    }

    return {
        type: 'memory' as const,
        config: getMemoryConfig()
    };
}

/**
 * Validate database configuration
 */
export function validateDatabaseConfig(): void {
    const databaseType = (process.env.DATABASE_TYPE as 'memory' | 'oracle') || 'memory';

    if (databaseType === 'oracle') {
        const oracleConfig = getOracleConfig();

        if (!oracleConfig.connectionString) {
            throw new Error('Oracle connection string is required');
        }

        if (!oracleConfig.user) {
            throw new Error('Oracle user is required');
        }

        if (!oracleConfig.password) {
            throw new Error('Oracle password is required');
        }

        if (oracleConfig.poolMin < 1) {
            throw new Error('Oracle pool minimum size must be at least 1');
        }

        if (oracleConfig.poolMax < oracleConfig.poolMin) {
            throw new Error('Oracle pool maximum size must be greater than or equal to minimum size');
        }

        if (oracleConfig.poolTimeout < 1) {
            throw new Error('Oracle pool timeout must be at least 1 second');
        }
    } else if (databaseType === 'memory') {
        const memoryConfig = getMemoryConfig();

        if (memoryConfig.autoSaveInterval < 1000) {
            throw new Error('Memory database auto-save interval must be at least 1000ms');
        }

        if (memoryConfig.persistToDisk && !memoryConfig.dataFile) {
            throw new Error('Memory database data file path is required when persist to disk is enabled');
        }
    }
}

/**
 * Database migration configuration
 */
export interface IMigrationConfig {
    enabled: boolean;
    directory: string;
    tableName: string;
    schemaName?: string;
    autoRun: boolean;
    validateChecksums: boolean;
}

/**
 * Get migration configuration
 */
export function getMigrationConfig(): IMigrationConfig {
    const config: IMigrationConfig = {
        enabled: process.env.DB_MIGRATIONS_ENABLED !== 'false',
        directory: process.env.DB_MIGRATIONS_DIR || 'migrations',
        tableName: process.env.DB_MIGRATIONS_TABLE || 'schema_migrations',
        autoRun: process.env.DB_MIGRATIONS_AUTO_RUN === 'true',
        validateChecksums: process.env.DB_MIGRATIONS_VALIDATE_CHECKSUMS !== 'false'
    };

    if (process.env.DB_SCHEMA_NAME) {
        config.schemaName = process.env.DB_SCHEMA_NAME;
    }

    return config;
}

/**
 * Database connection retry configuration
 */
export interface IRetryConfig {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    jitter: boolean;
}

/**
 * Get retry configuration for database connections
 */
export function getRetryConfig(): IRetryConfig {
    return {
        maxAttempts: parseInt(process.env.DB_RETRY_MAX_ATTEMPTS || '5', 10),
        initialDelay: parseInt(process.env.DB_RETRY_INITIAL_DELAY || '1000', 10),
        maxDelay: parseInt(process.env.DB_RETRY_MAX_DELAY || '30000', 10),
        backoffMultiplier: parseFloat(process.env.DB_RETRY_BACKOFF_MULTIPLIER || '2'),
        jitter: process.env.DB_RETRY_JITTER !== 'false'
    };
}

/**
 * Check if database is configured for production use
 */
export function isProductionDatabase(): boolean {
    return config.database.type === 'oracle' && config.server.env === 'production';
}

/**
 * Check if database supports transactions
 */
export function supportsTransactions(): boolean {
    return config.database.type === 'oracle';
}

/**
 * Get database connection timeout in milliseconds
 */
export function getConnectionTimeout(): number {
    if (config.database.type === 'oracle') {
        return getOracleConfig().poolTimeout * 1000;
    }
    return 5000; // 5 seconds for memory database
}
