# 📋 Task Manager API — Backend Intern Assignment

A production-ready REST API with JWT Authentication, Role-Based Access Control, and a React frontend.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | PostgreSQL + Sequelize ORM |
| Auth | JWT + bcryptjs |
| Frontend | React.js |
| Docs | Swagger (OpenAPI 3.0) |
| Optional | Docker, Docker Compose |

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   │   ├── authController.js
│   │   │   ├── taskController.js
│   │   │   └── adminController.js
│   │   ├── middleware/        # Auth, validation, errors
│   │   │   ├── auth.js
│   │   │   ├── validate.js
│   │   │   └── errorHandler.js
│   │   ├── models/            # Sequelize models
│   │   │   ├── User.js
│   │   │   └── Task.js
│   │   ├── routes/v1/         # Versioned routes
│   │   │   ├── authRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── config/
│   │   │   └── database.js
│   │   └── app.js
│   ├── swagger.yaml
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/             # Login, Register, Dashboard
│   │   ├── context/           # AuthContext (JWT state)
│   │   ├── api/               # Axios instance with interceptors
│   │   └── App.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Local Setup (Without Docker)

### Prerequisites
- Node.js v18+
- PostgreSQL 14+

### 1. Clone & Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials and JWT secret
npm install
npm run dev
```

### 2. Create PostgreSQL Database

```sql
CREATE DATABASE taskmanager_db;
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm start
```

### 4. Access

| Service | URL |
|---------|-----|
| Backend API | http://localhost:5000 |
| API Docs (Swagger) | http://localhost:5000/api/v1/docs |
| Frontend | http://localhost:3000 |
| Health Check | http://localhost:5000/health |

---

## 🐳 Docker Setup (Recommended)

```bash
# Run everything with one command
docker-compose up --build

# Stop
docker-compose down
```

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/register` | Public | Register user |
| POST | `/api/v1/auth/login` | Public | Login, returns JWT |
| GET | `/api/v1/auth/me` | Private | Get current user |

### Tasks (CRUD)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/tasks` | User/Admin | Get tasks (user: own, admin: all) |
| POST | `/api/v1/tasks` | User/Admin | Create task |
| GET | `/api/v1/tasks/:id` | User/Admin | Get task by ID |
| PUT | `/api/v1/tasks/:id` | User/Admin | Update task |
| DELETE | `/api/v1/tasks/:id` | User/Admin | Delete task |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/admin/stats` | Admin | Platform statistics |
| GET | `/api/v1/admin/users` | Admin | All users |
| PATCH | `/api/v1/admin/users/:id/toggle` | Admin | Activate/deactivate user |

---

## 🔑 Auth Flow

```
Register/Login → JWT Token → Send as: Authorization: Bearer <token>
```

---

## 🛡️ Security Practices

- **Password Hashing** — bcryptjs with 12 salt rounds
- **JWT** — Signed with secret, 7-day expiry
- **Input Validation** — express-validator on all endpoints
- **Input Sanitization** — trim + normalizeEmail
- **Role-Based Access** — middleware `authorize('admin')`
- **Error Handling** — Centralized, no stack traces in production
- **CORS** — Restricted to configured client URL

---

## 📈 Scalability Notes

This project is built to scale horizontally:

1. **Microservices** — Auth service and Task service can be separated independently
2. **Database** — PostgreSQL connection pooling (max: 10 connections). Read replicas can be added for heavy read loads
3. **Caching** — Redis can be plugged in for session tokens and frequent GET queries (e.g., task lists)
4. **Load Balancing** — Stateless JWT auth means any instance can handle any request; add Nginx or AWS ALB in front
5. **Docker** — Containerized for easy horizontal scaling on Kubernetes or ECS
6. **API Versioning** — `/api/v1/` prefix allows breaking changes in v2 without disrupting existing clients
7. **Logging** — Can add Winston + centralized logging (CloudWatch, Datadog) for observability

---

## 📖 API Documentation

Full interactive docs available at: `http://localhost:5000/api/v1/docs`

---

## 👤 Default Test Accounts

Create via `/api/v1/auth/register`. To make an admin, manually update the DB:
```sql
UPDATE "Users" SET role = 'admin' WHERE email = 'admin@example.com';
```
