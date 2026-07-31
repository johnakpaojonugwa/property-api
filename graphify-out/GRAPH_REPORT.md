# Graph Report - property-api  (2026-07-31)

## Corpus Check
- 157 files · ~59,058 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 553 nodes · 1213 edges · 39 communities (12 shown, 27 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 120 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `90ae9d52`
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
- `listUsers()` --references--> `User`  [EXTRACTED]
  src/services/admin.service.js → src/models/user.model.js
- `getNotifications()` --references--> `Appointment`  [EXTRACTED]
  src/controllers/notification.controller.js → src/models/appointment.model.js

## Import Cycles
- None detected.

## Communities (39 total, 27 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.05
Nodes (11): app, corsOptions, limiter, __dirname, __filename, setupSwagger(), swaggerPath, swaggerSpec (+3 more)

### Community 1 - "ApiError"
Cohesion: 0.07
Nodes (35): authenticate(), optionalAuthenticate(), authorize(), errorHandler(), notFoundHandler(), requestTimeout(), fileFilter(), storage (+27 more)

### Community 2 - ".notFound"
Cohesion: 0.09
Nodes (50): ensureOwnerOrAdmin(), injectGuestActor(), rbacGuard(), verifyRelation(), Agent, agentSchema, Appointment, appointmentSchema (+42 more)

### Community 3 - "notification.controller.js"
Cohesion: 0.09
Nodes (26): connectDB(), disconnectDB(), env, requiredEnv, validNodeEnvs, broadcastNotification(), getNotifications(), markAsRead() (+18 more)

### Community 4 - "ApiResponse"
Cohesion: 0.05
Nodes (43): createAgent, deleteAgent, getAgents, getAgentWishlist, updateAgentResource, confirmMeeting, createAppointment, deleteAppointment (+35 more)

### Community 5 - "auth.service.js"
Cohesion: 0.11
Nodes (22): Merchant, merchantSchema, Token, tokenSchema, Wishlist, wishlistSchema, verifyMerchant(), getAgentWishlist() (+14 more)

### Community 6 - "admin.service.js"
Cohesion: 0.06
Nodes (10): rejectDuplicateQueryParams(), banIp(), flagProperty(), getDashboard(), getProperties(), listUsers(), rejectProperty(), restoreBackup() (+2 more)

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
Cohesion: 0.36
Nodes (7): Review, reviewSchema, createReview(), deleteReview(), getReviewById(), getReviews(), updateReview()

## Knowledge Gaps
- **155 isolated node(s):** `name`, `version`, `description`, `main`, `start` (+150 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiResponse` connect `ApiResponse` to `app.js`, `notification.controller.js`, `admin.controller.js`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `ApiError` connect `ApiError` to `.notFound`, `notification.controller.js`, `ApiResponse`, `auth.service.js`, `admin.service.js`, `Review`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `Property` connect `.notFound` to `ApiError`, `notification.controller.js`, `admin.service.js`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _155 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.053555750658472345 - nodes in this community are weakly interconnected._
- **Should `ApiError` be split into smaller, more focused modules?**
  _Cohesion score 0.06738245094409478 - nodes in this community are weakly interconnected._
- **Should `.notFound` be split into smaller, more focused modules?**
  _Cohesion score 0.08732394366197183 - nodes in this community are weakly interconnected._