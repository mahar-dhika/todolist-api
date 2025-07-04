# Product Requirements Document (PRD)
## To-Do List API

**Version:** 1.0  
**Date:** July 2, 2025  
**Document Owner:** Development Team  

---

## 1. Executive Summary

This document outlines the requirements for developing a RESTful API for a To-Do List application. The API will enable users to manage multiple task lists, organize tasks within those lists, set deadlines, track completion status, and retrieve tasks based on various criteria.

## 2. Project Overview

### 2.1 Purpose
Build a robust API that serves as the backend for a to-do list application, providing comprehensive task and list management capabilities.

### 2.2 Scope
The API will handle:
- Multiple task lists management
- Task CRUD operations within lists
- Deadline management and filtering
- Task completion tracking
- Task ordering and retrieval

### 2.3 Success Criteria
- All functional requirements implemented
- RESTful API design principles followed
- Proper error handling and validation
- Comprehensive API documentation
- Performance benchmarks met

---

## 3. Functional Requirements

### 3.1 List Management

#### 3.1.1 Create List
- **Requirement ID:** FR-001
- **Description:** Users can create new task lists
- **Acceptance Criteria:**
  - API endpoint accepts list name and optional description
  - Validates required fields (name cannot be empty)
  - Returns created list with unique ID and timestamp
  - Handles duplicate name validation

#### 3.1.2 Retrieve All Lists
- **Requirement ID:** FR-002
- **Description:** Users can view all their lists with associated tasks
- **Acceptance Criteria:**
  - Returns all lists with basic information
  - Includes task count for each list
  - Optional: Include tasks within each list response
  - Supports pagination for large datasets

#### 3.1.3 Update List
- **Requirement ID:** FR-003
- **Description:** Users can modify existing list properties
- **Acceptance Criteria:**
  - Allows updating list name and description
  - Validates list existence before update
  - Returns updated list information
  - Maintains list creation timestamp

#### 3.1.4 Delete List
- **Requirement ID:** FR-004
- **Description:** Users can remove lists and associated tasks
- **Acceptance Criteria:**
  - Validates list existence before deletion
  - Handles cascade deletion of associated tasks
  - Returns confirmation of successful deletion
  - Prevents deletion of non-existent lists

### 3.2 Task Management

#### 3.2.1 Add Task to List
- **Requirement ID:** FR-005
- **Description:** Users can add new tasks to specific lists
- **Acceptance Criteria:**
  - Accepts task title, description, and list ID
  - Validates target list exists
  - Sets default status as "pending"
  - Returns created task with unique ID

#### 3.2.2 Update Task
- **Requirement ID:** FR-006
- **Description:** Users can modify existing task properties
- **Acceptance Criteria:**
  - Allows updating title, description, deadline, and status
  - Validates task existence before update
  - Maintains task creation timestamp
  - Returns updated task information

#### 3.2.3 Delete Task
- **Requirement ID:** FR-007
- **Description:** Users can remove tasks from lists
- **Acceptance Criteria:**
  - Validates task existence before deletion
  - Returns confirmation of successful deletion
  - Handles non-existent task gracefully

#### 3.2.4 Set Task Deadline
- **Requirement ID:** FR-008
- **Description:** Users can assign deadlines to tasks
- **Acceptance Criteria:**
  - Accepts date/time in standard format (ISO 8601)
  - Validates future dates only
  - Allows clearing/removing deadlines
  - Stores timezone information

#### 3.2.5 Mark Task as Completed
- **Requirement ID:** FR-009
- **Description:** Users can mark tasks as completed or pending
- **Acceptance Criteria:**
  - Toggles task completion status
  - Records completion timestamp
  - Allows reverting completion status
  - Updates last modified timestamp

### 3.3 Task Retrieval and Filtering

#### 3.3.1 Get Tasks Due This Week
- **Requirement ID:** FR-010
- **Description:** Users can retrieve tasks with deadlines in the current week
- **Acceptance Criteria:**
  - Filters tasks with deadlines between current date and end of current week
  - Returns tasks across all lists
  - Excludes completed tasks (configurable)
  - Sorts by deadline ascending

#### 3.3.2 Order Tasks by Deadline
- **Requirement ID:** FR-011
- **Description:** Users can retrieve tasks sorted by deadline
- **Acceptance Criteria:**
  - Supports ascending and descending order
  - Handles tasks without deadlines (appear last)
  - Applies to specific list or all lists
  - Maintains secondary sort by creation date

---

## 4. API Endpoints Specification

### 4.1 List Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/lists` | Retrieve all lists | - | Array of lists with task counts |
| POST | `/api/lists` | Create new list | `{name, description?}` | Created list object |
| GET | `/api/lists/{id}` | Get specific list with tasks | - | List object with tasks array |
| PUT | `/api/lists/{id}` | Update list | `{name?, description?}` | Updated list object |
| DELETE | `/api/lists/{id}` | Delete list | - | Success confirmation |

### 4.2 Task Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/lists/{listId}/tasks` | Add task to list | `{title, description?, deadline?}` | Created task object |
| PUT | `/api/tasks/{id}` | Update task | `{title?, description?, deadline?, completed?}` | Updated task object |
| DELETE | `/api/tasks/{id}` | Delete task | - | Success confirmation |
| PATCH | `/api/tasks/{id}/complete` | Toggle task completion | - | Updated task object |

### 4.3 Query Endpoints

| Method | Endpoint | Description | Query Parameters | Response |
|--------|----------|-------------|------------------|----------|
| GET | `/api/tasks/due-this-week` | Get tasks due this week | `includeCompleted?` | Array of tasks |
| GET | `/api/tasks` | Get tasks with sorting | `sortBy=deadline&order=asc&listId?` | Array of tasks |
| GET | `/api/lists/{id}/tasks` | Get tasks for specific list | `sortBy?&order?` | Array of tasks |

---

## 5. Data Models

### 5.1 List Model
```json
{
  "id": "string (UUID)",
  "name": "string (required, max 100 chars)",
  "description": "string (optional, max 500 chars)",
  "createdAt": "datetime (ISO 8601)",
  "updatedAt": "datetime (ISO 8601)",
  "taskCount": "integer"
}
```

### 5.2 Task Model
```json
{
  "id": "string (UUID)",
  "listId": "string (UUID, required)",
  "title": "string (required, max 200 chars)",
  "description": "string (optional, max 1000 chars)",
  "deadline": "datetime (ISO 8601, optional)",
  "completed": "boolean (default: false)",
  "completedAt": "datetime (ISO 8601, nullable)",
  "createdAt": "datetime (ISO 8601)",
  "updatedAt": "datetime (ISO 8601)"
}
```

---

## 6. Non-Functional Requirements

### 6.1 Performance
- API response time < 200ms for single record operations
- API response time < 500ms for list operations with <100 items
- Support for pagination on list endpoints

### 6.2 Security
- Input validation and sanitization
- SQL injection prevention
- Rate limiting implementation
- CORS configuration

### 6.3 Reliability
- 99.9% uptime availability
- Graceful error handling
- Transaction support for data consistency
- Database connection pooling

### 6.4 Scalability
- Horizontal scaling support
- Database indexing on frequently queried fields
- Caching strategy for read operations

---

## 7. Error Handling

### 7.1 HTTP Status Codes
- `200 OK` - Successful GET, PUT, PATCH operations
- `201 Created` - Successful POST operations
- `204 No Content` - Successful DELETE operations
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Server errors

### 7.2 Error Response Format
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}
```

---

## 8. Validation Rules

### 8.1 List Validation
- Name: Required, 1-100 characters, non-empty after trim
- Description: Optional, max 500 characters

### 8.2 Task Validation
- Title: Required, 1-200 characters, non-empty after trim
- Description: Optional, max 1000 characters
- Deadline: Valid ISO 8601 datetime, future date only
- ListId: Must reference existing list

---

## 9. Database Schema

### 9.1 Lists Table
```sql
CREATE TABLE lists (
    id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    description VARCHAR2(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update updated_at on modification
CREATE OR REPLACE TRIGGER trg_lists_updated_at
    BEFORE UPDATE ON lists
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/
```

### 9.2 Tasks Table
```sql
CREATE TABLE tasks (
    id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
    list_id RAW(16) NOT NULL,
    title VARCHAR2(200) NOT NULL,
    description VARCHAR2(1000),
    deadline TIMESTAMP WITH TIME ZONE,
    completed NUMBER(1) DEFAULT 0 CHECK (completed IN (0, 1)),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_list_id FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
);

-- Trigger to update updated_at on modification
CREATE OR REPLACE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Indexes for performance
CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

---

## 10. Testing Requirements

### 10.1 Unit Tests
- All business logic functions
- Data validation methods
- Error handling scenarios

### 10.2 Integration Tests
- API endpoint functionality
- Database operations
- Cross-list operations

### 10.3 Test Coverage
- Minimum 80% code coverage
- All critical paths covered
- Edge cases and error scenarios

---

## 11. Documentation Requirements

### 11.1 API Documentation
- OpenAPI/Swagger specification
- Interactive API explorer
- Request/response examples
- Error code reference

### 11.2 Developer Documentation
- Setup and installation guide
- Environment configuration
- Database setup instructions
- Deployment guidelines

---

## 12. Acceptance Criteria

### 12.1 Definition of Done
- [ ] All functional requirements implemented
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] API documentation complete
- [ ] Performance benchmarks met
- [ ] Security requirements satisfied
- [ ] Code review completed
- [ ] Deployment successful

### 12.2 User Acceptance Testing
- [ ] Can create and manage multiple lists
- [ ] Can perform CRUD operations on tasks
- [ ] Can set and manage task deadlines
- [ ] Can retrieve tasks due this week
- [ ] Can sort tasks by deadline
- [ ] Can mark tasks as completed
- [ ] Error handling works correctly
- [ ] Performance meets requirements

---

## 13. Assumptions and Dependencies

### 13.1 Assumptions
- Single user system (no multi-user authentication required)
- Tasks belong to exactly one list
- Week starts on Monday for "due this week" calculation
- Timezone handling uses server timezone or UTC

### 13.2 Dependencies
- Database system (Oracle Database recommended)
- Web framework (Express.js, Django, Spring Boot, etc.)
- UUID generation library (or use Oracle SYS_GUID())
- Date/time handling library
- Input validation library
- Oracle Database driver/connector

---

## 14. Future Enhancements

### 14.1 Phase 2 Features
- User authentication and authorization
- Task priorities and categories
- Task attachments and comments
- Recurring tasks
- Task sharing and collaboration
- Mobile push notifications
- Task templates

### 14.2 Advanced Features
- Task dependencies
- Time tracking
- Reporting and analytics
- Integration with calendar applications
- Bulk operations
- Advanced filtering and search
- Task history and audit trail

---

## 15. Conclusion

This PRD provides a comprehensive foundation for developing a robust To-Do List API. The requirements are designed to be clear, testable, and implementable while maintaining flexibility for future enhancements. Regular reviews and updates to this document should be conducted as the project progresses and new requirements emerge.

---

**Document History:**
- v1.0 - July 2, 2025 - Initial version
