# Property API

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v7.0-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

An enterprise-grade RESTful API for real estate property management platforms. Built with **Node.js (ES Modules)**, **Express**, and **MongoDB**, featuring robust authentication, role-based access control (RBAC), property listings, appointments, reviews, wishlists, and merchant/agent workflows.

---

## 🚀 Features

- **🔐 Authentication & Security**: JWT-based authentication, password hashing with `bcryptjs`, cookie security, request timeouts, and CORS protection.
- **🛡️ Rate Limiting & Protection**: Request rate-limiting via `express-rate-limit`, security headers via `helmet`, query parameter deduplication, and HTTP parameter pollution (`hpp`) defense.
- **🏢 Property Management**: Full CRUD operations for property listings with image upload capabilities via `cloudinary`.
- **👥 Role & User Management**: User management supporting multiple roles (Users, Agents, Merchants, Admins).
- **📅 Appointment Scheduling**: Schedule and manage property viewings and agent appointments.
- **⭐ Reviews & Wishlists**: Rate/review properties and manage user saved/wishlisted properties.
- **📜 API Documentation**: Interactive OpenAPI / Swagger UI documentation served directly at `/api-docs`.
- **🐳 Containerization**: Fully containerized using Docker and `docker-compose` with MongoDB health checks.
- **🧪 Automated Testing**: Unit and integration test suite powered by `vitest` and `supertest`.

---

## 🛠️ Technology Stack

| Category | Technology |
|---|---|
| **Runtime & Framework** | Node.js (ESM), Express.js v5 |
| **Database & ORM** | MongoDB, Mongoose ORM |
| **Caching & Storage** | Redis (`ioredis`), Cloudinary |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors`, `express-rate-limit` |
| **Validation & Error Handling** | `express-validator`, `joi`, `zod`, Custom Error Middleware |
| **Documentation** | Swagger / OpenAPI (`swagger-ui-express`, `swagger-jsdoc`) |
| **Testing** | Vitest, Supertest |
| **Containerization** | Docker, Docker Compose |

---

## 📁 Project Structure

```
property-api/
├── src/
│   ├── config/          # Environment & Database configurations
│   ├── controllers/     # Route controllers / request handlers
│   ├── middlewares/     # Auth, validation, security, & error middlewares
│   ├── models/          # Mongoose schemas and models
│   ├── routes/          # API route definitions (/v1/*)
│   ├── services/        # Business logic layer
│   ├── utils/           # Utility functions & response formatters
│   ├── validators/      # Input validation schemas
│   ├── app.js           # Express app setup and middleware pipeline
│   └── server.js        # HTTP server entry point & graceful shutdown
├── docker-compose.yml   # Multi-container Orchestration
├── Dockerfile           # Production Dockerfile
├── nodemon.json         # Nodemon dev configuration
├── package.json         # Dependencies and scripts
└── README.md            # Project documentation
```

---

## ⚙️ Prerequisites

Before getting started, ensure you have the following installed locally:

- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **MongoDB** (v7.0+ locally or a MongoDB Atlas URI)
- **Docker & Docker Compose** (Optional, for running via containers)

---

## 🔑 Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Define the following environment configuration variables in your `.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Connection
DATABASE_URL=mongodb://localhost:27017/property-api

# Security & Authentication
JWT_SECRET=your-super-secret-jwt-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000

# Cloudinary (Optional - For Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis Configuration (Optional - For Caching)
REDIS_URL=redis://localhost:6379
```

---

## 📦 Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/property-api.git
   cd property-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:5000` (or `http://localhost:6000` depending on your `PORT` configuration).

4. **Start in production mode:**
   ```bash
   npm start
   ```

---

## 🐳 Running with Docker

You can easily run the API alongside a MongoDB container using Docker Compose:

```bash
# Build and start services in detached mode
docker-compose up --build -d

# Check running containers
docker-compose ps

# View service logs
docker-compose logs -f api
```

The application health check is available at `http://localhost:5000/health`.

To stop the container stack:
```bash
docker-compose down
```

---

## 📖 API Documentation & Endpoints

Once the application is running, open your browser and navigate to:
```text
http://localhost:5000/api-docs
```
to access the interactive **Swagger UI** API documentation.

### Core Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | Health Check | No |
| `POST` | `/v1/auth/register` | Register a new user | No |
| `POST` | `/v1/auth/login` | User login | No |
| `POST` | `/v1/auth/refresh` | Refresh JWT access token | Yes |
| `GET` | `/v1/properties` | List properties with filters | No |
| `POST` | `/v1/properties` | Create a new property listing | Yes (Agent/Admin) |
| `GET` | `/v1/properties/:id` | Get property details | No |
| `PUT` | `/v1/properties/:id` | Update property listing | Yes (Owner/Admin) |
| `DELETE`| `/v1/properties/:id` | Delete property listing | Yes (Owner/Admin) |
| `GET` | `/v1/users/me` | Get active user profile | Yes |
| `GET` | `/v1/merchants` | List merchants | No |
| `GET` | `/v1/agents` | List registered agents | No |
| `POST` | `/v1/appointments` | Schedule a viewing appointment | Yes |
| `POST` | `/v1/reviews` | Submit a property review | Yes |
| `GET` | `/v1/wishlist` | View user saved properties | Yes |

---

## 🧪 Testing

Execute unit and integration tests with Vitest:

```bash
# Run all tests once
npm test

# Run tests in watch mode
npx vitest
```

---

## 📜 License

This project is licensed under the [ISC License](LICENSE).
