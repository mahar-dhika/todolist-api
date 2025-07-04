# Database Setup Guide

This guide covers the database configuration for the To-Do List API, including both development (Memory) and production (Oracle) setups.

## 📋 Overview

The To-Do List API supports two database strategies:
- **Memory Storage**: For development and testing (default)
- **Oracle Database**: For production environments

## 🔧 Memory Storage (Development)

### Configuration
Memory storage is the default for development and requires no additional setup.

```env
DATABASE_TYPE=memory
```

### Features
- **Zero Configuration**: No database installation required
- **Fast Development**: Instant startup with no connection overhead
- **Data Persistence**: Data persists during server runtime only
- **Testing**: Perfect for unit and integration tests
- **Seeding**: Automatic test data seeding available

### Usage
```bash
# Start with memory storage (default)
npm run dev
```

### Data Management
```typescript
// Clear all data (for testing)
listRepository.clear();
taskRepository.clear();

// Seed test data
listRepository.seed();
taskRepository.seed();
```

## 🗄️ Oracle Database (Production)

### Prerequisites
- Oracle Database 19c or later
- Oracle client libraries installed on server
- Database user with appropriate permissions

### Database Setup

#### 1. Create Database User
```sql
-- Connect as SYSDBA
sqlplus sys/password@hostname:port/service_name as sysdba

-- Create user
CREATE USER todolist_api IDENTIFIED BY your_secure_password;

-- Grant necessary privileges
GRANT CREATE SESSION TO todolist_api;
GRANT CREATE TABLE TO todolist_api;
GRANT CREATE SEQUENCE TO todolist_api;
GRANT CREATE TRIGGER TO todolist_api;
GRANT UNLIMITED TABLESPACE TO todolist_api;
```

#### 2. Run Migration Scripts
```bash
# Navigate to migration scripts
cd database/migrations/

# Execute in order
sqlplus todolist_api/password@hostname:port/service_name @001_create_lists_table.sql
sqlplus todolist_api/password@hostname:port/service_name @002_create_tasks_table.sql
sqlplus todolist_api/password@hostname:port/service_name @003_create_indexes_and_views.sql
sqlplus todolist_api/password@hostname:port/service_name @004_insert_sample_data.sql
```

#### 3. Environment Configuration
```env
# Database Configuration
DATABASE_TYPE=oracle

# Oracle Connection
DB_CONNECTION_STRING=oracle://todolist_api:password@hostname:1521/XEPDB1
DB_USER=todolist_api
DB_PASSWORD=your_secure_password

# Connection Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_INCREMENT=1
DB_POOL_TIMEOUT=60000
DB_STMT_CACHE_SIZE=30
```

### Database Schema

#### Lists Table
```sql
CREATE TABLE lists (
    id VARCHAR2(36) PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    description VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT lists_name_unique UNIQUE (name)
);
```

#### Tasks Table
```sql
CREATE TABLE tasks (
    id VARCHAR2(36) PRIMARY KEY,
    list_id VARCHAR2(36) NOT NULL,
    title VARCHAR2(200) NOT NULL,
    description VARCHAR2(1000),
    deadline TIMESTAMP,
    completed NUMBER(1) DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tasks_list_fk FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
    CONSTRAINT tasks_completed_chk CHECK (completed IN (0, 1))
);
```

### Indexes and Performance
```sql
-- Primary indexes (automatically created with primary keys)
-- Foreign key index
CREATE INDEX idx_tasks_list_id ON tasks(list_id);

-- Query optimization indexes
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_tasks_list_deadline ON tasks(list_id, deadline);
CREATE INDEX idx_tasks_list_completed ON tasks(list_id, completed);
```

### Triggers for Automatic Timestamps
```sql
-- Lists table trigger
CREATE OR REPLACE TRIGGER trg_lists_updated_at
    BEFORE UPDATE ON lists
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;

-- Tasks table trigger
CREATE OR REPLACE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
    
    -- Set completed_at when task is completed
    IF :NEW.completed = 1 AND :OLD.completed = 0 THEN
        :NEW.completed_at := CURRENT_TIMESTAMP;
    ELSIF :NEW.completed = 0 AND :OLD.completed = 1 THEN
        :NEW.completed_at := NULL;
    END IF;
END;
```

## 🔄 Migration Scripts

### Available Migrations
- `001_create_lists_table.sql` - Creates lists table with constraints
- `002_create_tasks_table.sql` - Creates tasks table with foreign keys
- `003_create_indexes_and_views.sql` - Adds performance indexes and views
- `004_insert_sample_data.sql` - Inserts test data for development

### Running Migrations
```bash
# Development/Testing
npm run migrate:dev

# Production
npm run migrate:prod

# Rollback (if needed)
npm run migrate:rollback
```

## 🔍 Database Views

### Task Summary View
```sql
CREATE OR REPLACE VIEW v_task_summary AS
SELECT 
    l.id as list_id,
    l.name as list_name,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.completed = 1 THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.completed = 0 THEN 1 END) as pending_tasks,
    COUNT(CASE WHEN t.deadline < CURRENT_TIMESTAMP AND t.completed = 0 THEN 1 END) as overdue_tasks
FROM lists l
LEFT JOIN tasks t ON l.id = t.list_id
GROUP BY l.id, l.name;
```

### Due This Week View
```sql
CREATE OR REPLACE VIEW v_tasks_due_this_week AS
SELECT t.*, l.name as list_name
FROM tasks t
JOIN lists l ON t.list_id = l.id
WHERE t.deadline BETWEEN 
    TRUNC(SYSDATE, 'IW') AND 
    TRUNC(SYSDATE, 'IW') + 6
AND t.completed = 0;
```

## 🚀 Production Deployment

### Connection Pool Configuration
```typescript
const poolConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION_STRING,
    poolMin: parseInt(process.env.DB_POOL_MIN || '2'),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10'),
    poolIncrement: parseInt(process.env.DB_POOL_INCREMENT || '1'),
    poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT || '60000'),
    stmtCacheSize: parseInt(process.env.DB_STMT_CACHE_SIZE || '30')
};
```

### Health Checks
```sql
-- Database health check query
SELECT 1 FROM DUAL;

-- Connection pool status
SELECT * FROM V$PROCESS;
SELECT * FROM V$SESSION;
```

## 🔧 Maintenance

### Regular Maintenance Tasks
1. **Statistics Update**: `EXEC DBMS_STATS.GATHER_SCHEMA_STATS('TODOLIST_API');`
2. **Index Rebuild**: Monitor and rebuild fragmented indexes
3. **Backup**: Regular database backups
4. **Log Analysis**: Monitor Oracle alert logs
5. **Performance Monitoring**: Track query performance and connection pool usage

### Monitoring Queries
```sql
-- Table sizes
SELECT table_name, num_rows FROM user_tables;

-- Index usage
SELECT index_name, table_name, last_analyzed FROM user_indexes;

-- Active sessions
SELECT username, status, machine FROM v$session WHERE username = 'TODOLIST_API';
```

## 🛠️ Troubleshooting

### Common Issues

#### Connection Issues
```
ORA-12154: TNS:could not resolve the connect identifier specified
```
**Solution**: Verify `DB_CONNECTION_STRING` format and network connectivity.

#### Permission Issues
```
ORA-00942: table or view does not exist
```
**Solution**: Ensure database user has proper table access permissions.

#### Pool Exhaustion
```
Error: Pool is exhausted
```
**Solution**: Increase `DB_POOL_MAX` or investigate connection leaks.

### Debug Configuration
```env
# Enable Oracle debug logging
DB_DEBUG=true
DB_LOG_LEVEL=debug
```

## 📚 Additional Resources

- [Oracle Database Documentation](https://docs.oracle.com/en/database/)
- [Node.js Oracle Driver](https://oracle.github.io/node-oracledb/)
- [SQL Performance Tuning](https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/)
- [Database Security Guide](https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/)

---

**Last Updated**: July 4, 2025  
**Document Version**: 1.0
