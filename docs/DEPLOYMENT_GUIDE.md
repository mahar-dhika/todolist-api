# Deployment Guide

This guide provides comprehensive instructions for deploying the To-Do List API to various environments including development, staging, and production.

## 📋 Overview

The To-Do List API supports multiple deployment strategies:
- **Development**: Local development with memory storage
- **Staging**: Testing environment with Oracle database
- **Production**: Full production deployment with monitoring and security

## 🎯 Deployment Checklist

### Pre-Deployment Checklist
- [ ] Code review completed and approved
- [ ] All tests passing (`npm run test`)
- [ ] Linting passed (`npm run lint`)
- [ ] Security review completed
- [ ] Environment configuration validated
- [ ] Database migrations tested
- [ ] Performance testing completed
- [ ] Documentation updated

### Environment Checklist
- [ ] Node.js 18+ installed
- [ ] Oracle database accessible (production/staging)
- [ ] Environment variables configured
- [ ] SSL certificates configured (production)
- [ ] Monitoring tools configured
- [ ] Backup procedures in place

## 🔧 Environment Setup

### Development Deployment
```bash
# Clone repository
git clone <repository-url>
cd todolist-api

# Install dependencies
npm install

# Setup environment
cp .env.example .env.development

# Start development server
npm run dev
```

### Staging Deployment
```bash
# Build application
npm run build

# Setup staging environment
cp .env.example .env.staging
# Edit .env.staging with staging database credentials

# Run migrations
npm run migrate:staging

# Start staging server
NODE_ENV=staging npm start
```

### Production Deployment
```bash
# Build optimized production bundle
npm run build

# Setup production environment
cp .env.example .env.production
# Configure production settings

# Run database migrations
npm run migrate:prod

# Start production server
NODE_ENV=production npm start
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /usr/src/app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  todolist-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_TYPE=oracle
      - DB_CONNECTION_STRING=${DB_CONNECTION_STRING}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
    depends_on:
      - oracle-db
    networks:
      - todolist-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  oracle-db:
    image: oracle/database:19.3.0-ee
    environment:
      - ORACLE_SID=XEPDB1
      - ORACLE_PDB=XEPDB1
      - ORACLE_PWD=${ORACLE_PASSWORD}
    volumes:
      - oracle-data:/opt/oracle/oradata
    networks:
      - todolist-network

networks:
  todolist-network:
    driver: bridge

volumes:
  oracle-data:
```

### Docker Commands
```bash
# Build image
docker build -t todolist-api .

# Run container
docker run -p 3000:3000 --env-file .env.production todolist-api

# Using Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f todolist-api

# Stop services
docker-compose down
```

## ☁️ Cloud Deployment

### AWS Deployment

#### Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init todolist-api

# Create environment
eb create production

# Deploy
eb deploy

# View logs
eb logs
```

#### ECS Deployment
```json
{
  "family": "todolist-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/taskRole",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/executionRole",
  "containerDefinitions": [
    {
      "name": "todolist-api",
      "image": "your-repo/todolist-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:db-password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/todolist-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Azure Deployment

#### App Service
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Create resource group
az group create --name todolist-rg --location eastus

# Create App Service plan
az appservice plan create --name todolist-plan --resource-group todolist-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group todolist-rg --plan todolist-plan --name todolist-api --runtime "NODE|18-lts"

# Deploy
az webapp deployment source config-zip --resource-group todolist-rg --name todolist-api --src dist.zip
```

### Google Cloud Deployment

#### Cloud Run
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash

# Authenticate
gcloud auth login

# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/todolist-api

# Deploy to Cloud Run
gcloud run deploy todolist-api \
  --image gcr.io/PROJECT_ID/todolist-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      
      # Deploy to your chosen platform
      - name: Deploy to Production
        run: |
          # Add your deployment commands here
          echo "Deploying to production..."
```

### GitLab CI
```yaml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run test
    - npm run lint
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

deploy:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache curl
    - # Add deployment script here
  only:
    - main
```

## 🔒 Security Configuration

### Production Security Settings
```env
# Security Headers
HELMET_ENABLED=true
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# SSL/TLS
SSL_ENABLED=true
SSL_CERT_PATH=/path/to/certificate.crt
SSL_KEY_PATH=/path/to/private.key

# Database Security
DB_SSL_ENABLED=true
DB_SSL_CERT_PATH=/path/to/db-cert.pem
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
}
```

## 📊 Monitoring and Logging

### Application Monitoring
```typescript
// monitoring.ts
import { performance } from 'perf_hooks';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = performance.now();
    
    res.on('finish', () => {
        const duration = performance.now() - start;
        console.log({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration.toFixed(2)}ms`,
            timestamp: new Date().toISOString()
        });
    });
    
    next();
};
```

### Health Check Endpoint
```typescript
// health.ts
app.get('/health', (req, res) => {
    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: 'connected', // Check database connection
        version: process.env.npm_package_version
    };
    
    res.status(200).json(health);
});
```

### Log Configuration
```typescript
// logger.ts
import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});
```

## 🚀 Performance Optimization

### Production Optimizations
```typescript
// production.ts
import compression from 'compression';
import helmet from 'helmet';

// Compression middleware
app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));
```

### Database Connection Pooling
```typescript
// database.ts
const poolConfig = {
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
    poolTimeout: 60000,
    stmtCacheSize: 30,
    queueMax: 500,
    queueTimeout: 60000
};
```

## 🔧 Environment Variables Reference

### Required Variables
```env
NODE_ENV=production
PORT=3000
DATABASE_TYPE=oracle
DB_CONNECTION_STRING=oracle://user:pass@host:port/service
```

### Optional Variables
```env
# Logging
LOG_LEVEL=info
LOG_FILE_ENABLED=true

# Monitoring
METRICS_ENABLED=true
HEALTH_CHECK_ENABLED=true

# Security
HELMET_ENABLED=true
RATE_LIMIT_ENABLED=true
```

## 🆘 Troubleshooting

### Common Deployment Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000
# or
netstat -tulpn | grep 3000

# Kill process
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Test database connectivity
telnet hostname 1521

# Check environment variables
env | grep DB_

# Test Oracle connection
sqlplus user/password@connection_string
```

#### Memory Issues
```bash
# Check memory usage
free -h
top -p $(pgrep node)

# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

#### SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in certificate.crt -text -noout

# Test SSL connection
openssl s_client -connect yourdomain.com:443
```

## 📚 Additional Resources

- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Oracle Database Connection Guide](https://oracle.github.io/node-oracledb/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [AWS Deployment Guide](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_nodejs.html)

---

**Last Updated**: July 4, 2025  
**Document Version**: 1.0
