# TODO: Deploy Frontend Locally and Add Node.js Backend with PostgreSQL

## 1. Deploy Frontend Locally
- [x] Install `serve` package globally
- [x] Serve the `dist` folder on a local port (e.g., 3000) - Running on http://localhost:3000

## 2. Set Up Backend Project
- [ ] Create `backend/` directory
- [ ] Initialize Node.js project with `npm init -y`
- [ ] Install dependencies: express, pg, cors, dotenv, bcryptjs (for auth), jsonwebtoken (for JWT)

## 3. Configure PostgreSQL Database
- [ ] Ensure PostgreSQL is installed and running locally
- [ ] Create database (e.g., `bib_esprim_db`)
- [ ] Define schema: tables for users, reports, consultations, etc.
- [ ] Create migration scripts or SQL files for schema

## 4. Set Up Express Server
- [ ] Create `server.js` with basic Express setup
- [ ] Configure middleware: CORS, JSON parsing, dotenv
- [ ] Set up database connection using pg

## 5. Create API Routes
- [ ] Auth routes: login, register (if needed)
- [ ] Reports routes: POST /reports (submit), GET /reports (fetch)
- [ ] Catalog routes: GET /catalog (public library catalog)
- [ ] Dashboard routes: GET /dashboard/student, GET /dashboard/admin, etc.

## 6. Update Frontend to Use Backend APIs
- [ ] Modify frontend components to fetch data from backend instead of mock data
- [ ] Add API base URL configuration (e.g., http://localhost:5000)
- [ ] Handle loading states, errors, and responses

## 7. Test Full Stack Locally
- [ ] Start backend server (e.g., on port 5000)
- [ ] Ensure frontend can communicate with backend
- [ ] Test key features: submit report, view catalog, dashboards

## 8. Environment Configuration
- [ ] Create `.env` file for backend with DB credentials
- [ ] Ensure sensitive data is not hardcoded
