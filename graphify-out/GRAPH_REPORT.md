# Graph Report - property-api  (2026-08-03)

## Corpus Check
- 161 files · ~64,537 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 581 nodes · 1285 edges · 46 communities (19 shown, 27 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 122 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5ccbd1f7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- index.js
- .notFound
- notification.test.js
- merchant.controller.js
- ApiError
- admin.service.js
- admin.controller.js
- RedisService
- package.json
- Property API
- dependencies
- phase9.test.js
- notificationInteraction.model.js
- express-validator
- compression
- auth.routes.js
- express
- express-rate-limit
- notification.controller.js
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
- authenticate
- property.controller.js
- user.controller.js
- appointment.controller.js
- agent.controller.js
- bcryptjs

## God Nodes (most connected - your core abstractions)
1. `app` - 58 edges
2. `User` - 35 edges
3. `Property` - 31 edges
4. `ApiError` - 29 edges
5. `Agent` - 24 edges
6. `Appointment` - 19 edges
7. `authenticate()` - 17 edges
8. `RedisService` - 17 edges
9. `ApiResponse` - 17 edges
10. `Merchant` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Docker Integration` --conceptually_related_to--> `Multi-container Stack`  [INFERRED]
  README.md → docker-compose.yml
- `getMerchantAgents()` --references--> `Agent`  [EXTRACTED]
  src/services/merchant.service.js → src/models/agent.model.js
- `getProperties()` --references--> `Property`  [EXTRACTED]
  src/services/admin.service.js → src/models/property.model.js
- `listUsers()` --references--> `User`  [EXTRACTED]
  src/services/admin.service.js → src/models/user.model.js
- `getNotifications()` --references--> `Appointment`  [EXTRACTED]
  src/controllers/notification.controller.js → src/models/appointment.model.js

## Import Cycles
- None detected.

## Communities (46 total, 27 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.05
Nodes (11): app, corsOptions, limiter, __dirname, __filename, setupSwagger(), swaggerPath, swaggerSpec (+3 more)

### Community 1 - "index.js"
Cohesion: 0.09
Nodes (27): optionalAuthenticate(), authorize(), fileFilter(), storage, upload, uploadArray(), uploadSingle(), validate() (+19 more)

### Community 2 - ".notFound"
Cohesion: 0.08
Nodes (55): ensureOwnerOrAdmin(), rbacGuard(), verifyRelation(), Agent, agentSchema, Appointment, appointmentSchema, Property (+47 more)

### Community 3 - "notification.test.js"
Cohesion: 0.12
Nodes (16): connectDB(), disconnectDB(), sanitizeURI(), actionSchema, deliveryStatusSchema, notificationSchema, NotificationPreference, notificationPreferenceSchema (+8 more)

### Community 4 - "merchant.controller.js"
Cohesion: 0.16
Nodes (11): createAgentByMerchant, createMerchant, getMerchantAgents, getMerchants, getMerchantWishlist, verifyAgent, createReview, deleteReview (+3 more)

### Community 5 - "ApiError"
Cohesion: 0.08
Nodes (30): env, requiredEnv, validNodeEnvs, notFoundHandler(), requestTimeout(), Merchant, merchantSchema, Token (+22 more)

### Community 6 - "admin.service.js"
Cohesion: 0.06
Nodes (12): rejectDuplicateQueryParams(), banIp(), banUser(), deleteUser(), getDashboard(), getProperties(), listUsers(), manageRoles() (+4 more)

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
Nodes (7): cors, dotenv, mongoose, dependencies, cors, dotenv, mongoose

### Community 16 - "auth.routes.js"
Cohesion: 0.24
Nodes (7): authLimiter, errorHandler(), router, router, forgotPasswordSchema, loginSchema, resetPasswordSchema

### Community 19 - "notification.controller.js"
Cohesion: 0.33
Nodes (8): broadcastNotification(), getNotifications(), markAsRead(), updatePreferences(), injectGuestActor(), Notification, NotificationAuditLog, notificationAuditLogSchema

### Community 39 - "Codebase Documentation: Property API"
Cohesion: 0.11
Nodes (17): 1. Executive Summary & Problem Space, 2. System Architecture & Component Design, 3. Detailed Data Models & Relationships, 4.1 Notification Pipeline & Quiet-Hours Engine, 4.2 Local Image Compression & Cloudinary Storage, 4. Key Subsystem Workflows, 5. Complete API Routes Table, 6.1 Fallback-Mode Caching & Resilience (+9 more)

### Community 40 - "authenticate"
Cohesion: 0.22
Nodes (7): createToken, forgotPassword, login, resetPassword, createWishlist, authenticate(), ApiResponse

### Community 41 - "property.controller.js"
Cohesion: 0.22
Nodes (8): buyProperty, createProperty, deleteProperty, getProperties, getPropertyById, setVerified, updateProperty, updatePropertyResource

### Community 42 - "user.controller.js"
Cohesion: 0.22
Nodes (8): createUser, deleteUser, getUserById, getUserProperties, getUsers, getUserWishlist, updateUser, updateUserResource

### Community 43 - "appointment.controller.js"
Cohesion: 0.25
Nodes (7): confirmMeeting, createAppointment, deleteAppointment, getAppointments, setAgentCompletion, setUserCompletion, updateAppointment

### Community 44 - "agent.controller.js"
Cohesion: 0.33
Nodes (5): createAgent, deleteAgent, getAgents, getAgentWishlist, updateAgentResource

## Knowledge Gaps
- **168 isolated node(s):** `name`, `version`, `description`, `main`, `start` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiResponse` connect `authenticate` to `app.js`, `merchant.controller.js`, `ApiError`, `admin.controller.js`, `property.controller.js`, `user.controller.js`, `appointment.controller.js`, `agent.controller.js`, `auth.routes.js`, `notification.controller.js`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `ApiError` connect `ApiError` to `index.js`, `.notFound`, `notification.controller.js`, `admin.service.js`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `User` connect `.notFound` to `index.js`, `notification.test.js`, `ApiError`, `admin.service.js`, `authenticate`, `notification.controller.js`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.053555750658472345 - nodes in this community are weakly interconnected._
- **Should `index.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08563134978229318 - nodes in this community are weakly interconnected._
- **Should `.notFound` be split into smaller, more focused modules?**
  _Cohesion score 0.08049334631613113 - nodes in this community are weakly interconnected._