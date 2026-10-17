# Smart Health Record - MySQL Edition

Separate MySQL/Aiven edition of Smart Health Record. The original MongoDB edition remains unchanged in its own folder/repository.

## Tech stack
- Frontend: React
- Backend: Node.js, Express
- Database: MySQL (Aiven compatible, using mysql2)
- Auth: JWT / session-based routes

## Key features
- User authentication with patient/doctor roles
- Appointment scheduling and doctor panel
- Medical record CRUD and secure file uploads
- AI-powered chat assistant (prototype route)
- Unit/integration tests for server routes

## Quick setup (local)
1. Create an Aiven MySQL service and copy its host, port, database, user, password and CA certificate into `server/.env`. Copy `server/.env.example` as the starting point. Tables are created automatically on the first successful connection.

2. Install server dependencies

```bash
cd smart-health-record/server
npm install
npm run dev
```

3. Install and run client

```bash
cd smart-health-record/client
npm install
npm start
```

Or run `npm install` and `npm start` from the project root after installing both app folders.

## Required environment variables

- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`: Aiven MySQL connection settings
- `MYSQL_SSL=true` and `MYSQL_SSL_CA`: required for a secure Aiven connection
- `JWT_SECRET`: long, random signing secret
- `FRONTEND_URL`: allowed browser origin and password-reset URL
- `EMAIL_USER` / `EMAIL_PASS`: Gmail credentials for password-reset email

## Production build (client)

```bash
cd smart-health-record/client
npm run build
# serve the `build` folder or configure your static host
```

## Resume-ready bullets
- Built a full-stack Smart Health Record app (React, Node.js/Express, MySQL) implementing authentication, role-based doctor/patient views, appointment scheduling, and secure medical-record CRUD.
- Integrated file upload pipeline and an AI chat assistant endpoint; designed RESTful APIs and reusable React components to improve developer productivity and UX.
- Wrote unit and integration tests for critical server routes, added production build scripts and startup automation for local demos.

Suggested single-line resume entry:

"Developed a full-stack Smart Health Record application (React, Node.js, MySQL) with authentication, appointment scheduling, medical-record management, secure file uploads, and an AI chat prototype."

## Demo / next steps
- Deploy the backend to Heroku/Azure and frontend to Vercel for a live demo link.
- Add CI (GitHub Actions) to run tests and lint on PRs.
- Replace placeholders with metrics (users onboarded, test coverage, performance gains) for stronger impact.

---
If you want, I can: deploy a live demo, add CI, or expand tests next.
