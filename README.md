# Lab Report System

Full-stack app for labs to submit patient reports and for an admin to review them.

- **Backend:** Node.js, Express, Sequelize, MySQL, JWT
- **Frontend:** React (Vite), React Router

## Prerequisites

- Node.js 18 or later
- MySQL 8 (create an empty database named `lab_report_system`)

## Project layout

```
backend/     REST API, MySQL models, file uploads
frontend/     React UI
```

## 1. Create the database

In MySQL:

```sql
CREATE DATABASE lab_report_system;
```

## 2. Configure and start the API

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env` with your MySQL user and password. Then:

```bash
npm install
npm run create-admin
npm run dev
```

The API listens on `http://localhost:5000`.

Default admin (change these in `.env` before creating the account):

- Email: `admin@labreport.local`
- Password: `Admin123!`

## 3. Start the UI

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Labs register from the Register page. Admins sign in on the same Login page.

## API

| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | public | Register a lab |
| POST | `/api/auth/login` | public | Login (lab or admin) |
| GET | `/api/auth/me` | any logged-in user | Current user |
| POST | `/api/reports` | lab | Submit a report (multipart, optional `file`) |
| GET | `/api/reports` | lab / admin | List reports. Admin filters: `labName`, `status`, `date` |
| GET | `/api/reports/:id` | lab (own) / admin | Report details |
| PATCH | `/api/reports/:id/review` | admin | Mark report reviewed |
| GET | `/api/reports/:id/file` | lab (own) / admin | View or download attachment (`?download=true`) |

Uploaded files are stored in `backend/uploads` and the filename is saved on the report row.
