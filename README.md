# 📋 Team Task Manager (Full-Stack)
Live Deployment: ideal-passion-production-605f.up.railway.app
Loom Video : https://www.loom.com/share/d4583ad201b54385a730f0a6b0dde4c2
A web app where users can create projects, assign tasks, and track progress with **role-based access (Admin / Member)**.

**Stack:** Next.js (frontend) · Node.js + Express (backend) · MongoDB (Mongoose) · JWT auth


## ✨ Features

- **Authentication** — Signup / Login with JWT + bcrypt password hashing
- **Roles**
  - **Admin** — create projects, add members, create & assign tasks, update anything, delete projects/tasks
  - **Member** — see only projects they're in and tasks assigned to them; can update **their own** task status
- **Project & team management** — create projects, attach members
- **Task management** — create, assign, set due date, change status (To Do / In Progress / Done)
- **Dashboard** — total tasks, count by status, and **overdue** tasks
- **Role-based access control** enforced on the backend (not just hidden in UI)

---

## 📁 Folder Structure

```
team-task-manager/
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── models/                 # User, Project, Task (Mongoose schemas)
│   ├── middleware/             # auth (JWT verify), roleCheck (Admin only)
│   ├── controllers/            # auth, project, task logic
│   ├── routes/                 # /api/auth, /api/projects, /api/tasks
│   ├── server.js               # entry point
│   └── .env                    # MONGO_URI, JWT_SECRET, PORT
│
└── frontend/                   # Next.js (App Router)
    ├── app/
    │   ├── login/ signup/      # auth pages
    │   ├── dashboard/          # stats + my tasks
    │   ├── projects/           # list + create
    │   ├── projects/[id]/      # tasks per project
    │   └── Navbar.js
    ├── lib/api.js              # fetch wrapper + token handling
    └── .env.local              # NEXT_PUBLIC_API_URL
```

---

## 🛠️ Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB running locally (via MongoDB Compass / `mongodb://127.0.0.1:27017`) **OR** a MongoDB Atlas URI

### 1. Backend

```bash
cd backend
npm install
npm run dev          # starts on http://localhost:5000
```

`.env` (already included for local dev):
```
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
JWT_SECRET=mySuperSecretKey_change_this_123456
PORT=5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev          # starts on http://localhost:3000
```

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Try it
1. Open http://localhost:3000
2. Sign up one account as **Admin** and one (different email) as **Member**
3. As Admin → Projects → create a project, tick the Member to add them
4. Open the project → add a task and assign it to the Member, set a due date
5. Log in as the Member → Dashboard shows their task → change its status
6. Watch the dashboard stats + overdue count update

---

## 🌐 Deployment (Railway)

> Local MongoDB won't work on Railway — use **MongoDB Atlas** (free) for the deployed DB.

### Step 1 — MongoDB Atlas
1. Create a free **M0** cluster at https://www.mongodb.com/cloud/atlas
2. **Network Access** → allow `0.0.0.0/0`
3. Copy the connection string and add your DB name:
   `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/taskmanager?retryWrites=true&w=majority`

### Step 2 — Deploy Backend
1. Push this repo to GitHub
2. On Railway → **New Project → Deploy from GitHub** → pick the repo
3. Set **Root Directory** = `backend`
4. Add environment variables:
   - `MONGO_URI` = your Atlas string
   - `JWT_SECRET` = any long random string
5. Railway auto-runs `npm install` and `npm start`
6. Copy the public backend URL (e.g. `https://xxx.up.railway.app`)

### Step 3 — Deploy Frontend
1. On Railway → **New Service → same GitHub repo**
2. Set **Root Directory** = `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://xxx.up.railway.app/api`  *(your backend URL + `/api`)*
4. Railway runs `npm install`, `npm run build`, then `npm start`
5. Open the frontend URL — your app is live ✅

---

## 🔌 API Reference

All protected routes need header: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Access | Body |
|--------|----------|--------|------|
| POST | `/api/auth/signup` | public | name, email, password, role |
| POST | `/api/auth/login` | public | email, password |
| GET | `/api/auth/me` | logged in | — |
| GET | `/api/auth/users` | logged in | — |

### Projects
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/projects` | logged in (filtered by role) |
| POST | `/api/projects` | Admin |
| GET | `/api/projects/:id` | logged in |
| PUT | `/api/projects/:id` | Admin |
| DELETE | `/api/projects/:id` | Admin (cascades tasks) |

### Tasks
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/tasks` | logged in (filtered by role) |
| GET | `/api/tasks/dashboard` | logged in (stats) |
| GET | `/api/tasks/project/:projectId` | logged in |
| POST | `/api/tasks` | Admin |
| PUT | `/api/tasks/:id` | Admin (full) / Member (own status) |
| DELETE | `/api/tasks/:id` | Admin |

---

## 🎥 Demo Video Checklist (2–5 min)
1. Show signup (Admin + Member)
2. Admin creates project + adds member
3. Admin creates & assigns a task with a due date
4. Member logs in, sees only their task, updates status
5. Show dashboard stats + overdue
6. Show that a Member is blocked from admin actions (role-based access)
7. Show the **live Railway URL** working

---

## ✅ Requirements Coverage
- [x] REST APIs + Database (MongoDB / NoSQL)
- [x] Proper validations (express-validator) & relationships (Mongoose refs)
- [x] Role-based access control (Admin / Member, enforced server-side)
- [x] Authentication (JWT)
- [x] Dashboard (tasks, status, overdue)
- [x] Deployment-ready (Railway config documented)
```
