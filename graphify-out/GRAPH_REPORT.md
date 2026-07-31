# Graph Report - .  (2026-07-31)

## Corpus Check
- 157 files · ~55,503 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 548 nodes · 1195 edges · 38 communities (11 shown, 27 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 119 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App Server and Swagger Setup
- Authentication and File Middlewares
- RBAC and Database Models
- Database and Environment Configuration
- Agent and Appointment Controllers
- Merchant Model and Query Middlewares
- User Model and Admin Services
- Admin Route Controllers
- Redis Caching Service
- Package Metadata and Scripts
- Docker Compose and Document Guides
- Database and Media Dependencies
- Pagination and Tests
- Notification Interaction Model
- Bcryptjs Dependency
- Compression Dependency
- CORS Dependency
- Express Dependency
- Express Rate Limit Dependency
- Express Validator Dependency
- Helmet Dependency
- HPP Dependency
- IoRedis Dependency
- Joi Dependency
- JSONWebToken Dependency
- Lodash Dependency
- Multer Dependency
- Resend Dependency
- Rolldown Binding Dependency
- Sentry Node Dependency
- Sharp Dependency
- Socket.IO Dependency
- Supertest Dependency
- Swagger JSDoc Dependency
- Swagger UI Express Dependency
- Vitest Dependency
- YAML Dependency
- Zod Dependency

## God Nodes (most connected - your core abstractions)
1. `app` - 56 edges
2. `Property` - 31 edges
3. `User` - 29 edges
4. `ApiError` - 29 edges
5. `Agent` - 21 edges
6. `Appointment` - 19 edges
7. `RedisService` - 17 edges
8. `NotificationService` - 15 edges
9. `ApiResponse` - 15 edges
10. `authenticate()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Docker Integration` --conceptually_related_to--> `Multi-container Stack`  [INFERRED]
  README.md → docker-compose.yml
- `getMerchantAgents()` --references--> `Agent`  [EXTRACTED]
  src/services/merchant.service.js → src/models/agent.model.js
- `getNotifications()` --references--> `Appointment`  [EXTRACTED]
  src/controllers/notification.controller.js → src/models/appointment.model.js
- `getNotifications()` --references--> `Property`  [EXTRACTED]
  src/controllers/notification.controller.js → src/models/property.model.js
- `broadcastNotification()` --references--> `User`  [EXTRACTED]
  src/controllers/notification.controller.js → src/models/user.model.js

## Import Cycles
- None detected.

## Communities (38 total, 27 thin omitted)

### Community 0 - "App Server and Swagger Setup"
Cohesion: 0.06
Nodes (11): app, corsOptions, limiter, __dirname, __filename, setupSwagger(), swaggerPath, swaggerSpec (+3 more)

### Community 1 - "Authentication and File Middlewares"
Cohesion: 0.08
Nodes (31): authenticate(), optionalAuthenticate(), authorize(), errorHandler(), fileFilter(), storage, upload, uploadArray() (+23 more)

### Community 2 - "RBAC and Database Models"
Cohesion: 0.11
Nodes (44): ensureOwnerOrAdmin(), rbacGuard(), verifyRelation(), Agent, agentSchema, Appointment, Property, propertySchema (+36 more)

### Community 3 - "Database and Environment Configuration"
Cohesion: 0.08
Nodes (27): connectDB(), disconnectDB(), env, requiredEnv, validNodeEnvs, broadcastNotification(), getNotifications(), markAsRead() (+19 more)

### Community 4 - "Agent and Appointment Controllers"
Cohesion: 0.05
Nodes (43): createAgent, deleteAgent, getAgents, getAgentWishlist, updateAgentResource, confirmMeeting, createAppointment, deleteAppointment (+35 more)

### Community 5 - "Merchant Model and Query Middlewares"
Cohesion: 0.08
Nodes (29): notFoundHandler(), requestTimeout(), Merchant, merchantSchema, Review, reviewSchema, Token, tokenSchema (+21 more)

### Community 6 - "User Model and Admin Services"
Cohesion: 0.06
Nodes (17): rejectDuplicateQueryParams(), User, userSchema, banIp(), banUser(), deleteUser(), getDashboard(), getUserDetail() (+9 more)

### Community 7 - "Admin Route Controllers"
Cohesion: 0.05
Nodes (42): approveProperty, banIp, banUser, createBackup, deleteUser, exportReport, flagProperty, generateReports (+34 more)

### Community 9 - "Package Metadata and Scripts"
Cohesion: 0.13
Nodes (14): allowScripts, @scarf/scarf@1.4.0, author, description, keywords, license, main, name (+6 more)

### Community 10 - "Docker Compose and Document Guides"
Cohesion: 0.20
Nodes (12): API Service Container, MongoDB Service Container, Multi-container Stack, Redis Service Container, API Documentation, Authentication & Security, Cloudinary Integration, Docker Integration (+4 more)

### Community 11 - "Database and Media Dependencies"
Cohesion: 0.29
Nodes (7): cloudinary, dotenv, mongoose, dependencies, cloudinary, dotenv, mongoose

## Knowledge Gaps
- **154 isolated node(s):** `name`, `version`, `description`, `main`, `start` (+149 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiError` connect `Merchant Model and Query Middlewares` to `Authentication and File Middlewares`, `RBAC and Database Models`, `Database and Environment Configuration`, `Agent and Appointment Controllers`, `User Model and Admin Services`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `ApiResponse` connect `Agent and Appointment Controllers` to `App Server and Swagger Setup`, `Database and Environment Configuration`, `Admin Route Controllers`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `Property` connect `RBAC and Database Models` to `Authentication and File Middlewares`, `Database and Environment Configuration`, `User Model and Admin Services`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _154 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Server and Swagger Setup` be split into smaller, more focused modules?**
  _Cohesion score 0.05547785547785548 - nodes in this community are weakly interconnected._
- **Should `Authentication and File Middlewares` be split into smaller, more focused modules?**
  _Cohesion score 0.07589285714285714 - nodes in this community are weakly interconnected._
- **Should `RBAC and Database Models` be split into smaller, more focused modules?**
  _Cohesion score 0.10546448087431694 - nodes in this community are weakly interconnected._