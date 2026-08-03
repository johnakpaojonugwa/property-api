# Graph Report - property-api  (2026-08-03)

## Corpus Check
- 163 files · ~65,348 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 590 nodes · 1313 edges · 49 communities (20 shown, 29 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 122 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bcaf1c26`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- authenticate.js
- .notFound
- notification.controller.js
- asyncHandler.js
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
- env.js
- express
- express-rate-limit
- merchant.controller.js
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
- swagger.js
- Codebase Documentation: Property API
- ApiResponse
- property.controller.js
- user.controller.js
- appointment.controller.js
- agent.controller.js
- bcryptjs
- requestLogger.js
- cors
- cookieSecurity.js

## God Nodes (most connected - your core abstractions)
1. `app` - 59 edges
2. `User` - 36 edges
3. `Property` - 31 edges
4. `ApiError` - 29 edges
5. `Agent` - 25 edges
6. `Appointment` - 19 edges
7. `authenticate()` - 17 edges
8. `RedisService` - 17 edges
9. `ApiResponse` - 17 edges
10. `Merchant` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Docker Integration` --conceptually_related_to--> `Multi-container Stack`  [INFERRED]
  README.md → docker-compose.yml
- `getProperties()` --references--> `Property`  [EXTRACTED]
  src/services/admin.service.js → src/models/property.model.js
- `listUsers()` --references--> `User`  [EXTRACTED]
  src/services/admin.service.js → src/models/user.model.js
- `getNotifications()` --references--> `Appointment`  [EXTRACTED]
  src/controllers/notification.controller.js → src/models/appointment.model.js
- `getNotifications()` --references--> `Property`  [EXTRACTED]
  src/controllers/notification.controller.js → src/models/property.model.js

## Import Cycles
- None detected.

## Communities (49 total, 29 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.07
Nodes (3): app, corsOptions, limiter

### Community 1 - "authenticate.js"
Cohesion: 0.06
Nodes (42): authenticate(), optionalAuthenticate(), authorize(), errorHandler(), fileFilter(), storage, upload, uploadArray() (+34 more)

### Community 2 - ".notFound"
Cohesion: 0.09
Nodes (47): ensureOwnerOrAdmin(), rbacGuard(), verifyRelation(), Appointment, Property, Review, reviewSchema, User (+39 more)

### Community 3 - "notification.controller.js"
Cohesion: 0.08
Nodes (29): connectDB(), disconnectDB(), sanitizeURI(), broadcastNotification(), getNotifications(), markAsRead(), updatePreferences(), injectGuestActor() (+21 more)

### Community 4 - "asyncHandler.js"
Cohesion: 0.28
Nodes (6): createReview, deleteReview, getReviews, updateReview, createWishlist, asyncHandler()

### Community 5 - "ApiError"
Cohesion: 0.09
Nodes (25): notFoundHandler(), requestTimeout(), Agent, agentSchema, merchantSchema, Token, tokenSchema, Wishlist (+17 more)

### Community 6 - "admin.service.js"
Cohesion: 0.05
Nodes (14): rejectDuplicateQueryParams(), banIp(), banUser(), deleteUser(), getDashboard(), getProperties(), getUserDetail(), listUsers() (+6 more)

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
Nodes (7): cloudinary, dotenv, mongoose, dependencies, cloudinary, dotenv, mongoose

### Community 16 - "env.js"
Cohesion: 0.23
Nodes (3): env, requiredEnv, validNodeEnvs

### Community 19 - "merchant.controller.js"
Cohesion: 0.29
Nodes (6): createAgentByMerchant, createMerchant, getMerchantAgents, getMerchants, getMerchantWishlist, verifyAgent

### Community 38 - "swagger.js"
Cohesion: 0.33
Nodes (5): __dirname, __filename, setupSwagger(), swaggerPath, swaggerSpec

### Community 39 - "Codebase Documentation: Property API"
Cohesion: 0.11
Nodes (17): 1. Executive Summary & Problem Space, 2. System Architecture & Component Design, 3. Detailed Data Models & Relationships, 4.1 Notification Pipeline & Quiet-Hours Engine, 4.2 Local Image Compression & Cloudinary Storage, 4. Key Subsystem Workflows, 5. Complete API Routes Table, 6.1 Fallback-Mode Caching & Resilience (+9 more)

### Community 40 - "ApiResponse"
Cohesion: 0.22
Nodes (7): createToken, forgotPassword, login, resetPassword, authLimiter, router, ApiResponse

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
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiResponse` connect `ApiResponse` to `app.js`, `authenticate.js`, `notification.controller.js`, `asyncHandler.js`, `admin.controller.js`, `property.controller.js`, `user.controller.js`, `appointment.controller.js`, `agent.controller.js`, `merchant.controller.js`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `User` connect `.notFound` to `authenticate.js`, `notification.controller.js`, `ApiError`, `admin.service.js`, `env.js`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `ApiError` connect `ApiError` to `authenticate.js`, `.notFound`, `notification.controller.js`, `admin.service.js`, `ApiResponse`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07329462989840348 - nodes in this community are weakly interconnected._
- **Should `authenticate.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06378378378378378 - nodes in this community are weakly interconnected._
- **Should `.notFound` be split into smaller, more focused modules?**
  _Cohesion score 0.09176587301587301 - nodes in this community are weakly interconnected._