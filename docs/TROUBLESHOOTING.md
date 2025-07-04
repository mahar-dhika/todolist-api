# Troubleshooting Guide

This guide provides solutions to common issues encountered when developing, deploying, or using the To-Do List API.

## 📋 Table of Contents

- [Installation Issues](#installation-issues)
- [Development Server Issues](#development-server-issues)
- [Database Connection Issues](#database-connection-issues)
- [API Request Issues](#api-request-issues)
- [Testing Issues](#testing-issues)
- [Build and Deployment Issues](#build-and-deployment-issues)
- [Performance Issues](#performance-issues)
- [Environment Configuration Issues](#environment-configuration-issues)
- [Common Error Messages](#common-error-messages)
- [Debug Tools and Techniques](#debug-tools-and-techniques)

## 🔧 Installation Issues

### Issue: npm install fails
```bash
Error: npm ERR! peer dep missing: typescript@>=4.5.0
```

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# If still failing, check Node.js version
node --version  # Should be 18+ 
npm --version   # Should be 8+

# Update npm if needed
npm install -g npm@latest
```

### Issue: TypeScript not found
```bash
Error: 'tsc' is not recognized as an internal or external command
```

**Solutions:**
```bash
# Install TypeScript globally
npm install -g typescript

# Or use npx
npx tsc --version

# Verify TypeScript in project
npm list typescript
```

### Issue: Permission errors during installation
```bash
Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Solutions:**
```bash
# Linux/Mac: Use sudo (not recommended for production)
sudo npm install -g typescript

# Better: Configure npm to use different directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Windows: Run command prompt as administrator
# Or use npm config to set different cache directory
```

## 🖥️ Development Server Issues

### Issue: Port already in use
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
```bash
# Find process using port (Linux/Mac)
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Use different port
PORT=3001 npm run dev

# Or kill all node processes (use with caution)
pkill -f node
```

### Issue: Hot reload not working
**Symptoms:** Changes not reflected without manual restart

**Solutions:**
```bash
# Check if files are being watched
# Ensure no syntax errors in code

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev

# Check file permissions
chmod -R 755 src/

# Disable antivirus real-time scanning of project folder (Windows)
```

### Issue: Environment variables not loading
```bash
Error: Cannot read property 'DATABASE_TYPE' of undefined
```

**Solutions:**
```bash
# Check .env file exists
ls -la .env*

# Verify file format (no spaces around =)
DATABASE_TYPE=memory  # Correct
DATABASE_TYPE = memory  # Incorrect

# Check file encoding (should be UTF-8)
file .env.development

# Restart development server
npm run dev
```

## 🗄️ Database Connection Issues

### Issue: Oracle database connection fails
```bash
Error: ORA-12154: TNS:could not resolve the connect identifier specified
```

**Solutions:**
```bash
# Check connection string format
DB_CONNECTION_STRING=oracle://username:password@hostname:port/service_name

# Test network connectivity
telnet hostname 1521
ping hostname

# Verify Oracle client installation
sqlplus username/password@hostname:port/service_name

# Check firewall settings
# Ensure port 1521 is open

# Verify Oracle service is running
```

### Issue: Database connection pool exhausted
```bash
Error: Pool is exhausted
```

**Solutions:**
```bash
# Increase pool size
DB_POOL_MAX=20
DB_POOL_MIN=5

# Check for connection leaks in code
# Ensure connections are properly closed

# Monitor connection usage
# Add connection pool monitoring

# Restart database service if needed
```

### Issue: Memory storage not persisting data
**Symptoms:** Data disappears when server restarts

**Solutions:**
```bash
# This is expected behavior for memory storage
# Data only persists during server runtime

# For persistent development data, use Oracle
DATABASE_TYPE=oracle

# Or implement file-based storage for development
# Add data seeding for consistent test data
```

## 🌐 API Request Issues

### Issue: CORS errors in browser
```bash
Error: Access to fetch at 'http://localhost:3000/api/lists' from origin 'http://localhost:3001' has been blocked by CORS policy
```

**Solutions:**
```bash
# Check CORS configuration in environment
CORS_ORIGIN=http://localhost:3001

# For development, allow all origins
CORS_ORIGIN=*

# Verify CORS middleware is configured
# Check browser developer tools for exact error

# Test API directly (bypass CORS)
curl -X GET http://localhost:3000/api/lists
```

### Issue: 404 Not Found for API endpoints
```bash
Error: Cannot GET /api/lists
```

**Solutions:**
```bash
# Verify server is running
curl http://localhost:3000/health

# Check route configuration
# Ensure API prefix is correct (/api)

# Verify controller is properly registered
# Check for typos in endpoint URLs

# Test base URL
curl http://localhost:3000/
```

### Issue: Request validation errors
```bash
Error: "title" is required
```

**Solutions:**
```bash
# Check request body format
Content-Type: application/json

# Verify required fields are included
{
  "title": "My Task",
  "description": "Task description"
}

# Check validation schema
# Use Swagger UI for correct request format
# Visit http://localhost:3000/docs
```

### Issue: Authentication/Authorization errors
```bash
Error: 401 Unauthorized
```

**Solutions:**
```bash
# Check if authentication is enabled
# Verify API keys or tokens

# For development, ensure auth is disabled
# Or use proper authentication headers

# Check middleware configuration
# Verify authentication service is running
```

## 🧪 Testing Issues

### Issue: Tests failing due to port conflicts
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
```bash
# Use different port for tests
TEST_PORT=3001 npm test

# Or configure test to use random port
# Check test setup configuration

# Ensure no other instances running
pkill -f node
npm test
```

### Issue: Database tests failing
```bash
Error: Connection refused
```

**Solutions:**
```bash
# Use memory storage for tests
# Configure test environment
NODE_ENV=test DATABASE_TYPE=memory npm test

# Ensure test database is available
# Or mock database interactions

# Check test setup file
# Verify database configuration
```

### Issue: Jest configuration errors
```bash
Error: Cannot find module '@/services'
```

**Solutions:**
```bash
# Check jest.config.cjs
moduleNameMapping: {
  '^@/(.*)$': '<rootDir>/src/$1'
}

# Verify tsconfig.json paths
"paths": {
  "@/*": ["src/*"]
}

# Clear Jest cache
npx jest --clearCache
```

### Issue: Mock functions not working
```bash
Error: mockReturnValue is not a function
```

**Solutions:**
```bash
# Use jest.mocked for TypeScript
const mockRepository = jest.mocked(repository);

# Or cast to jest.Mock
(repository.findById as jest.Mock).mockReturnValue(data);

# Ensure proper mock setup
beforeEach(() => {
  jest.clearAllMocks();
});
```

## 🏗️ Build and Deployment Issues

### Issue: TypeScript compilation errors
```bash
Error: TS2307: Cannot find module '@/services'
```

**Solutions:**
```bash
# Check tsconfig.json paths configuration
"baseUrl": ".",
"paths": {
  "@/*": ["src/*"]
}

# Verify Vite configuration
# Check import statements are correct

# Clear TypeScript cache
rm -rf node_modules/.cache
npm run build
```

### Issue: Build succeeds but runtime errors
```bash
Error: Cannot resolve module at runtime
```

**Solutions:**
```bash
# Check output directory structure
ls -la dist/

# Verify all dependencies are included
# Check for missing environment variables

# Test built application
NODE_ENV=production node dist/index.js

# Check for absolute vs relative paths
```

### Issue: Deployment fails on cloud platforms
```bash
Error: Application failed to start
```

**Solutions:**
```bash
# Check platform-specific requirements
# Verify Node.js version compatibility

# Check logs for specific errors
heroku logs --tail  # Heroku
aws logs tail        # AWS

# Ensure all environment variables are set
# Check memory limits and resource allocation

# Verify start script in package.json
"start": "node dist/index.js"
```

## ⚡ Performance Issues

### Issue: Slow API response times
**Symptoms:** Requests taking longer than expected

**Solutions:**
```bash
# Profile API performance
# Add request timing middleware

# Check database query performance
# Add database connection pooling

# Monitor memory usage
node --inspect dist/index.js

# Enable compression middleware
# Optimize database queries
# Add caching where appropriate
```

### Issue: Memory leaks
**Symptoms:** Memory usage continuously increasing

**Solutions:**
```bash
# Profile memory usage
node --inspect --inspect-brk dist/index.js

# Check for unclosed database connections
# Verify event listeners are removed

# Use memory profiling tools
# Monitor garbage collection

# Check for circular references
# Use WeakMap/WeakSet for caches
```

### Issue: High CPU usage
**Symptoms:** Server becomes unresponsive

**Solutions:**
```bash
# Profile CPU usage
node --inspect --cpu-prof dist/index.js

# Check for infinite loops
# Optimize heavy computations

# Add request rate limiting
# Implement async processing for heavy tasks

# Monitor with tools like top/htop
top -p $(pgrep node)
```

## ⚙️ Environment Configuration Issues

### Issue: Environment variables not loading
```bash
Error: process.env.DATABASE_TYPE is undefined
```

**Solutions:**
```bash
# Check file naming
.env.development  # Correct
.env.dev         # Incorrect

# Verify NODE_ENV setting
echo $NODE_ENV

# Check dotenv configuration
# Ensure no trailing spaces

# Debug environment loading
console.log(process.env.DATABASE_TYPE);
```

### Issue: Configuration conflicts
**Symptoms:** Different behavior in different environments

**Solutions:**
```bash
# Check environment precedence
# .env.local > .env.development > .env

# Verify configuration loading order
# Use environment-specific files

# Print current configuration
# Add configuration validation

# Document all required variables
```

## ❌ Common Error Messages

### `Cannot read property 'id' of null`
**Cause:** Trying to access property of null/undefined object

**Solutions:**
```typescript
// Use optional chaining
const id = user?.id;

// Check before accessing
if (user && user.id) {
  // Safe to use user.id
}

// Use default values
const id = user?.id || 'default-id';
```

### `ValidationError: "title" is required`
**Cause:** Required field missing in request

**Solutions:**
```typescript
// Check request body
const { title, description } = req.body;
if (!title) {
  throw new ValidationError('Title is required');
}

// Use validation middleware
app.use('/api', validateRequest(schema));
```

### `TypeError: Cannot read property 'findById' of undefined`
**Cause:** Repository not properly injected

**Solutions:**
```typescript
// Ensure proper dependency injection
const service = new TaskService(taskRepository, listRepository);

// Check constructor parameters
constructor(
  private readonly taskRepository: ITaskRepository
) {}
```

### `ORA-00001: unique constraint violated`
**Cause:** Attempting to insert duplicate data

**Solutions:**
```sql
-- Check existing data
SELECT * FROM lists WHERE name = 'duplicate-name';

-- Handle in application
try {
  await repository.create(data);
} catch (error) {
  if (error.code === 'ORA-00001') {
    throw new ValidationError('Name already exists');
  }
  throw error;
}
```

## 🔍 Debug Tools and Techniques

### Logging Best Practices
```typescript
// Use structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console()
  ]
});

// Log with context
logger.info('User created', { 
  userId: user.id, 
  email: user.email,
  timestamp: new Date().toISOString()
});
```

### API Testing with curl
```bash
# Test GET endpoint
curl -X GET http://localhost:3000/api/lists

# Test POST with data
curl -X POST http://localhost:3000/api/lists \
  -H "Content-Type: application/json" \
  -d '{"name":"Test List","description":"Test"}'

# Test with authentication
curl -X GET http://localhost:3000/api/lists \
  -H "Authorization: Bearer your-token"

# Save response to file
curl -X GET http://localhost:3000/api/lists > response.json
```

### Database Debugging
```sql
-- Check connection status
SELECT 1 FROM DUAL;

-- View table contents
SELECT * FROM lists ORDER BY created_at DESC;

-- Check constraints
SELECT constraint_name, status FROM user_constraints 
WHERE table_name = 'TASKS';

-- Monitor sessions
SELECT username, status, machine FROM v$session 
WHERE username = 'TODOLIST_API';
```

### Node.js Debugging
```bash
# Debug with VS Code
node --inspect-brk dist/index.js

# Debug with Chrome DevTools
node --inspect dist/index.js
# Open chrome://inspect

# Memory profiling
node --inspect --prof dist/index.js

# CPU profiling
node --prof dist/index.js
```

### Health Check Script
```bash
#!/bin/bash
# health-check.sh

echo "Checking API health..."

# Check server response
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Server is running"
else
    echo "❌ Server is not responding"
    exit 1
fi

# Check database connection
if curl -f http://localhost:3000/api/lists > /dev/null 2>&1; then
    echo "✅ Database connection working"
else
    echo "❌ Database connection failed"
    exit 1
fi

echo "🎉 All checks passed!"
```

## 📞 Getting Help

### Internal Resources
1. **Documentation**: Check `/docs` directory
2. **API Documentation**: Visit `/docs` endpoint
3. **Code Comments**: Review JSDoc comments
4. **Test Cases**: Look at test files for usage examples

### External Resources
1. **Node.js Documentation**: https://nodejs.org/docs/
2. **Express.js Guide**: https://expressjs.com/
3. **TypeScript Handbook**: https://www.typescriptlang.org/docs/
4. **Jest Testing**: https://jestjs.io/docs/

### Community Support
1. **Stack Overflow**: Tag questions with relevant technology
2. **GitHub Issues**: Report bugs and feature requests
3. **Discord/Slack**: Team communication channels

### Creating Effective Bug Reports
```markdown
## Bug Report Template

**Environment**
- OS: [e.g., Windows 11, Ubuntu 20.04]
- Node.js: [e.g., 18.16.0]
- npm: [e.g., 9.6.7]
- Database: [Oracle 19c / Memory]

**Steps to Reproduce**
1. Start server with `npm run dev`
2. Send POST request to `/api/lists`
3. Include request body: `{"name": "Test"}`
4. Observe error response

**Expected Behavior**
Should create list and return 201 status

**Actual Behavior**
Returns 500 error with message "Internal Server Error"

**Logs/Screenshots**
```
[2025-07-04T10:30:00.000Z] ERROR: Database connection failed
```

**Additional Context**
This started happening after updating dependencies
```

---

**Last Updated**: July 4, 2025  
**Document Version**: 1.0  
**Next Review**: When major issues are discovered or resolved
