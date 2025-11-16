# TODO: Deploy Frontend Locally and Add Node.js Backend with PostgreSQL

## 1. Deploy Frontend Locally
- [x] Install `serve` package globally
- [x] Serve the `dist` folder on a local port (e.g., 3000) - Running on http://localhost:3000

## 2. Set Up Backend Project
- [x] Create `backend/` directory
- [x] Initialize Node.js project with `npm init -y`
- [x] Install dependencies: express, pg, cors, dotenv, bcryptjs (for auth), jsonwebtoken (for JWT)

## 3. Configure PostgreSQL Database
- [x] Ensure PostgreSQL is installed and running locally
- [x] Create database (e.g., `bib_esprim_db`)
- [x] Define schema: tables for users, reports, consultations, etc.
- [x] Create migration scripts or SQL files for schema

## 4. Set Up Express Server
- [x] Create `server.js` with basic Express setup
- [x] Configure middleware: CORS, JSON parsing, dotenv
- [x] Set up database connection using pg

## 5. Create API Routes
- [x] Auth routes: login, register (if needed)
- [x] Reports routes: POST /reports (submit), GET /reports (fetch)
- [x] Catalog routes: GET /catalog (public library catalog)
- [x] Dashboard routes: GET /dashboard/student, GET /dashboard/admin, etc.

## 6. Update Frontend to Use Backend APIs
- [ ] Create API service layer (`src/services/api.js`)
- [ ] Add environment configuration for API base URL
- [ ] Update authentication to use real API calls
- [ ] Update StudentDashboard to fetch real data
- [ ] Update other components to use API calls
- [ ] Add proper error handling and loading states

## 7. Test Full Stack Locally
- [ ] Start backend server (e.g., on port 5000)
- [ ] Ensure frontend can communicate with backend
- [ ] Test key features: login, submit report, view catalog, dashboards

## 8. Environment Configuration
- [ ] Create `.env` file for backend with DB credentials
- [ ] Ensure sensitive data is not hardcoded
