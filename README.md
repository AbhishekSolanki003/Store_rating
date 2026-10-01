# Store Rating Platform

A simple full-stack coding challenge project where users can rate registered stores. The application uses one login flow for administrators, normal users, and store owners.

## Architecture

- `frontend`: React application using Axios for API calls.
- `backend`: Express REST API. Authentication and role checks will live on the backend.
- `PostgreSQL`: Relational database accessed with the `pg` package and parameterized SQL queries.
- `JWT`: The token identifies the user and role. The frontend uses it for navigation, but authorization is enforced by Express middleware.

The implementation is split into a small Express API and a Vite React client. The API is the source of truth for authentication, roles, validation, and rating ownership.

## Database Schema

- `users`: `id`, `name`, `email`, `password`, `address`, `role`, timestamps. `role` is `ADMIN`, `NORMAL_USER`, or `STORE_OWNER`.
- `stores`: `id`, `name`, `email`, `address`, `owner_id`, timestamps. `owner_id` references `users.id`.
- `ratings`: `id`, `user_id`, `store_id`, `rating`, timestamps. Foreign keys reference users and stores, rating is 1-5, and `(user_id, store_id)` is unique.

Store averages will be calculated from `ratings` with SQL rather than duplicated on `stores`.

## API Overview

- `POST /api/auth/register` - public registration for normal users.
- `POST /api/auth/login` - public login for all roles.
- `GET /api/auth/me` - authenticated current-user details.
- `PUT /api/users/password` - authenticated password update.
- `GET /api/admin/dashboard` - admin statistics.
- `GET|POST /api/admin/users` - admin user listing and creation.
- `GET|POST /api/admin/stores` - admin store listing and creation.
- `GET /api/stores` - authenticated store search with overall and personal ratings.
- `POST|PUT /api/stores/:storeId/ratings` - normal user rating creation or update.
- `GET /api/owner/dashboard` - store owner average and rating details.
- `GET /api/health` - server health check.
- `GET /api/health/db` - PostgreSQL connection check.

Important protected endpoints:

| Method | URL | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Create a normal user account. |
| POST | `/api/auth/login` | No | Log in any role and receive a JWT. |
| GET | `/api/auth/me` | Yes | Return the current user without a password. |
| PUT | `/api/users/password` | Yes | Change the current user's password. |
| GET | `/api/admin/dashboard` | Admin | Return user, store, and rating totals. |
| GET/POST | `/api/admin/users` | Admin | Filter users or create staff/user accounts. |
| GET/POST | `/api/admin/stores` | Admin | Filter stores or create a store for an owner. |
| GET | `/api/stores` | Normal user | Search stores and return overall and personal ratings. |
| POST/PUT | `/api/stores/:storeId/ratings` | Normal user | Create or update one rating for a store. |
| GET | `/api/owner/dashboard` | Store owner | Show owned-store averages and rating users. |

Protected requests use `Authorization: Bearer <token>`. Query parameters support store search and admin filtering/sorting.

## Folder Structure

```text
backend/
  src/
    config/db.js
    controllers/
    middleware/
    routes/
    app.js
    server.js
frontend/
  src/
    components/
    context/
    pages/
    services/
    App.jsx
    main.jsx
```

## Completed Implementation

1. Express server and PostgreSQL pool.
2. Relational schema, indexes, and seed script.
3. JWT authentication and bcrypt password hashing.
4. Shared authentication and role middleware.
5. Admin, store/rating, owner, and password APIs.
6. React authentication flow and protected routes.
7. Role dashboards, search, sorting, validation, and rating updates.
8. Focused validation tests and production frontend build.

## Local Setup

Requirements: Node.js 18+ and PostgreSQL.

Create a PostgreSQL database first, for example:

```text
createdb store_rating
```

Backend:

```text
cd backend
npm install
copy .env.example .env
```

Set `DATABASE_URL` and a private `JWT_SECRET` in `backend/.env`. Then create the tables and seed data:

```text
psql "$env:DATABASE_URL" -f schema.sql
npm run seed
npm run dev
```

Frontend, in a second terminal:

```text
cd frontend
npm install
copy .env.example .env
npm run dev
```

The API runs on `http://localhost:5000` and the frontend normally runs on `http://localhost:5173`. Open `/api/health` and `/api/health/db` to check the backend.

## Seed Credentials

All seeded accounts use `Password1!`:

- Admin: `admin@example.com`
- Normal users: `aarav@example.com`, `meera@example.com`
- Store owners: `owner1@example.com`, `owner2@example.com`

The seed script resets the three application tables, so use it only for local development.

## Validation and Decisions

- User names are validated at 20-60 characters, addresses at 400 characters, and passwords at 8-16 characters with an uppercase and special character.
- Ratings are integers from 1-5 and the database unique constraint prevents duplicate user/store ratings.
- Rating writes use `ON CONFLICT` so the same endpoint can create or modify a rating.
- Passwords and role authorization are handled by the backend; the frontend only controls navigation and presentation.
- No password is selected in public API responses.

Backend checks: `npm run check` and `npm run check:health`. Frontend check: `npm run build`.
