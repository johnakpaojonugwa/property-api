# Graph Report - property-api  (2026-08-01)

## Corpus Check
- 158 files · ~62,318 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 571 nodes · 1230 edges · 40 communities (13 shown, 27 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 120 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6074f229`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- ApiError
- .notFound
- notification.controller.js
- ApiResponse
- auth.service.js
- admin.service.js
- admin.controller.js
- RedisService
- package.json
- Property API
- dependencies
- phase9.test.js
- notificationInteraction.model.js
- Review
- compression
- cors
- express
- express-rate-limit
- express-validator
- helmet
- hpp
- ioredis
- joi
- jsonwebtoken
- lodash
- multer
- resend
- @rolldown/binding-win32-x64-msvc
- @sentry/node
- sharp
- socket.io
- supertest
- swagger-jsdoc
- swagger-ui-express
- vitest
- yaml
- zod
- cloudinary
- Codebase Documentation: Property API

## God Nodes (most connected - your core abstractions)
1. `app` - 57 edges
2. `Property` - 31 edges
3. `User` - 29 edges
4. `ApiError` - 29 edges
5. `Agent` - 21 edges
6. `Appointment` - 19 edges
7. `RedisService` - 17 edges
8. `NotificationService` - 15 edges
9. `ApiResponse` - 15 edges
10. `env` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Docker Integration` --conceptually_related_to--> `Multi-container Stack`  [INFERRED]
  README.md → docker-compose.yml
- `getMerchantAgents()` --references--> `Agent`  [EXTRACTED]
  src/services/merchant.service.js → src/models/agent.model.js
- `getProperties()` --references--> `Property`  [EXTRACTED]
  src/services/admin.service.js → src/models/property.model.js
- `getNotifications()` --references--> `Appointment`  [EXTRACTED]
  src/controllers/notification.controller.js → src/models/appointment.model.js
- `getNotifications()` --references--> `Property`  [EXTRACTED]
  src/controllers/notification.controller.js → src/models/property.model.js

## Import Cycles
- None detected.

## Communities (40 total, 27 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (12): app, corsOptions, limiter, __dirname, __filename, setupSwagger(), swaggerPath, swaggerSpec (+4 more)

### Community 1 - "ApiError"
Cohesion: 0.07
Nodes (34): authenticate(), optionalAuthenticate(), authorize(), ensureOwnerOrAdmin(), errorHandler(), requestTimeout(), storage, upload (+26 more)

### Community 2 - ".notFound"
Cohesion: 0.12
Nodes (42): rbacGuard(), verifyRelation(), Agent, agentSchema, Appointment, Property, approveProperty(), flagProperty() (+34 more)

### Community 3 - "notification.controller.js"
Cohesion: 0.07
Nodes (29): connectDB(), disconnectDB(), env, requiredEnv, validNodeEnvs, broadcastNotification(), getNotifications(), markAsRead() (+21 more)

### Community 4 - "ApiResponse"
Cohesion: 0.05
Nodes (43): createAgent, deleteAgent, getAgents, getAgentWishlist, updateAgentResource, confirmMeeting, createAppointment, deleteAppointment (+35 more)

### Community 5 - "auth.service.js"
Cohesion: 0.11
Nodes (22): Merchant, merchantSchema, Token, tokenSchema, Wishlist, wishlistSchema, verifyMerchant(), getAgentWishlist() (+14 more)

### Community 6 - "admin.service.js"
Cohesion: 0.06
Nodes (17): rejectDuplicateQueryParams(), fileFilter(), User, banIp(), banUser(), deleteUser(), getDashboard(), getProperties() (+9 more)

### Community 7 - "admin.controller.js"
Cohesion: 0.05
Nodes (43): approveProperty, banIp, banUser, createBackup, deleteUser, exportReport, flagProperty, generateReports (+35 more)

### Community 9 - "package.json"
Cohesion: 0.13
Nodes (14): allowScripts, @scarf/scarf@1.4.0, author, description, keywords, license, main, name (+6 more)

### Community 10 - "Property API"
Cohesion: 0.20
Nodes (12): API Service Container, MongoDB Service Container, Multi-container Stack, Redis Service Container, API Documentation, Authentication & Security, Cloudinary Integration, Docker Integration (+4 more)

### Community 11 - "dependencies"
Cohesion: 0.29
Nodes (7): bcryptjs, dotenv, mongoose, dependencies, bcryptjs, dotenv, mongoose

### Community 14 - "Review"
Cohesion: 0.43
Nodes (5): Review, reviewSchema, createReview(), getReviewById(), getReviews()

### Community 39 - "Codebase Documentation: Property API"
Cohesion: 0.11
Nodes (17): 1. Executive Summary & Problem Space, 2. System Architecture & Component Design, 3. Detailed Data Models & Relationships, 4.1 Notification Pipeline & Quiet-Hours Engine, 4.2 Local Image Compression & Cloudinary Storage, 4. Key Subsystem Workflows, 5. Complete API Routes Table, 6.1 Fallback-Mode Caching & Resilience (+9 more)

## Knowledge Gaps
- **166 isolated node(s):** `name`, `version`, `description`, `main`, `start` (+161 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiResponse` connect `ApiResponse` to `app.js`, `notification.controller.js`, `admin.controller.js`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `ApiError` connect `ApiError` to `app.js`, `.notFound`, `notification.controller.js`, `ApiResponse`, `auth.service.js`, `admin.service.js`, `Review`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `Property` connect `.notFound` to `ApiError`, `notification.controller.js`, `admin.service.js`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _166 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05547785547785548 - nodes in this community are weakly interconnected._
- **Should `ApiError` be split into smaller, more focused modules?**
  _Cohesion score 0.07042253521126761 - nodes in this community are weakly interconnected._
- **Should `.notFound` be split into smaller, more focused modules?**
  _Cohesion score 0.12053872053872054 - nodes in this community are weakly interconnected._