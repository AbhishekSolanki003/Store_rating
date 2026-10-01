# Store Rating Platform

**Developer:** Abhishek Mukesh Solanki

A full-stack coding challenge project where users can rate registered stores. The application uses one login flow for administrators, normal users, and store owners.

## Architecture

- `frontend`: React application using Axios for API calls.
- `backend`: Express REST API. Authentication and role checks are enforced on the backend.
- `PostgreSQL`: Relational database accessed with the `pg` package and parameterized SQL queries.
- `JWT`: The token identifies the user and role. The frontend uses it for navigation, while authorization is enforced by Express middleware.

The implementation is split into a small Express API and a Vite React client. The API is the source of truth for authentication, roles, validation, and rating ownership.

## Database Schema

- `users`: `id`, `name`, `email`, `password`, `address`, `role`, timestamps. `role` is `ADMIN`, `NORMAL_USER`, or `STORE_OWNER`.
- `stores`: `id`, `name`, `email`, `address`, `owner_id`, timestamps. `owner_id` references `users.id`.
- `ratings`: `id`, `user_id`, `store_id`, `rating`, timestamps. Foreign keys reference users and stores, rating is 1-5, and `(user_id, store_id)` is unique.

Store averages are calculated from `ratings` with SQL rather than duplicated on `stores`.

## API Overview

- `POST /api/auth/register` - public registration for normal users.
- `POST /api/auth/login` - public login for all roles.
- `GET /api/auth/me` - authenticated current-user details.
- `PUT /api/users/password` - authenticated password update.
- `GET /api/admin/dashboard` - admin statistics.
- `GET|POST /api/admin/users` - admin user listing and creation.
- `GET /api/admin/users/:id` - get details of an individual user.
- `GET|POST /api/admin/stores` - admin store listing and creation.
- `GET /api/stores` - authenticated store search with overall and personal ratings.
- `POST|PUT /api/stores/:storeId/ratings` - normal user rating creation or update.
- `GET /api/owner/dashboard` - store owner average and rating details.
- `GET /api/health` - server health check.
- `GET /api/health/db` - PostgreSQL connection check.

### Important Protected Endpoints

| Method | URL | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Create a normal user account. |
| POST | `/api/auth/login` | No | Log in any role and receive a JWT. |
| GET | `/api/auth/me` | Yes | Return the current user without a password. |
| PUT | `/api/users/password` | Yes | Change the current user's password. |
| GET | `/api/admin/dashboard` | Admin | Return user, store, and rating totals. |
| GET/POST | `/api/admin/users` | Admin | List or create users. Filtering and sorting are supported by the API. |
| GET | `/api/admin/users/:id` | Admin | Return details of an individual user. |
| GET/POST | `/api/admin/stores` | Admin | List or create stores. Filtering and sorting are supported by the API. |
| GET | `/api/stores` | Normal User | Search stores and return overall and personal ratings. |
| POST/PUT | `/api/stores/:storeId/ratings` | Normal User | Create or update one rating for a store. |
| GET | `/api/owner/dashboard` | Store Owner | Show owned-store averages and rating users. |

Protected requests use:

```text
Authorization: Bearer <token>
```

Query parameters support store search and API-level admin filtering and sorting.

## Folder Structure

The project uses a small structure so the main application flow remains easy to follow.

```text
store-rating/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── schema.sql
│   ├── seed.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Completed Implementation

The current implementation includes:

1. Express server and PostgreSQL connection pool.
2. Relational database schema, indexes, and seed script.
3. JWT authentication and bcrypt password hashing.
4. Shared authentication and role middleware.
5. Admin, store/rating, owner, and password APIs.
6. React authentication flow and protected routes.
7. Role dashboards, store search, user rating updates, and API-level filtering/sorting.
8. Frontend production build and focused backend validation checks.

## Local Setup

### Requirements

- Node.js 18+
- PostgreSQL
- npm

### 1. Create the Database

Create a PostgreSQL database first:

```text
createdb store_rating
```

Alternatively, create the database using pgAdmin.

### 2. Setup Backend

```text
cd backend
npm install
copy .env.example .env
```

Set `DATABASE_URL` and a private `JWT_SECRET` in `backend/.env`.

Create the tables:

```text
psql "$env:DATABASE_URL" -f schema.sql
```

Seed the database:

```text
npm run seed
```

Start the backend:

```text
npm run dev
```

The API normally runs at:

```text
http://localhost:5000
```

### 3. Setup Frontend

Open a second terminal:

```text
cd frontend
npm install
copy .env.example .env
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

The backend can be checked using:

```text
http://localhost:5000/api/health
```

and:

```text
http://localhost:5000/api/health/db
```

## Seed Credentials

All seeded accounts use:

```text
Password1!
```

### Admin

```text
Email: admin@example.com
Role: ADMIN
```

### Normal Users

```text
Email: aarav@example.com
Role: NORMAL_USER

Email: meera@example.com
Role: NORMAL_USER
```

### Store Owners

```text
Email: owner1@example.com
Role: STORE_OWNER

Email: owner2@example.com
Role: STORE_OWNER
```

The seed script resets the three application tables, so it should only be used for local development and testing.

## Validation and Implementation Decisions

- User names are validated at 20-60 characters.
- Addresses are limited to 400 characters.
- Passwords are validated at 8-16 characters with at least one uppercase letter and one special character.
- Ratings are integers from 1-5.
- The database unique constraint prevents duplicate user/store ratings.
- Rating writes use `ON CONFLICT` so the same rating operation can create or update a user's rating for a store.
- Passwords and role authorization are handled by the backend.
- The frontend uses authentication state for navigation and presentation, but does not replace backend authorization.
- No password is selected in public API responses.
- Store averages are calculated from the ratings table using SQL.
- Store-owner access is restricted to rating information belonging to the owner's store.

## Search, Filtering and Sorting

Normal users can search stores through the store API.

The admin API supports filtering and sorting for user and store listings through query parameters.

Examples:

```text
GET /api/admin/users?name=Rahul&role=NORMAL_USER
```

```text
GET /api/admin/users?sortBy=name&order=asc
```

```text
GET /api/admin/stores?sortBy=name&order=desc
```

The current admin frontend does not provide separate filter and sort controls for these API features; filtering and sorting are currently supported at the API level.

## Rating Flow

A normal user can submit one rating per store.

For example:

```text
User A → Store A → 5
```

If the same user later changes the rating:

```text
User A → Store A → 4
```

the existing rating is updated rather than creating another rating.

The database constraint on:

```text
(user_id, store_id)
```

prevents duplicate ratings.

The overall store rating is calculated from all ratings for that store.

## Testing and Checks

The current backend checks focus on validation and ID parsing.

Run:

```text
npm run check
```

Backend health check:

```text
npm run check:health
```

Frontend production build:

```text
npm run build
```

The current automated tests do not yet cover the complete authentication and business-logic flow, such as:

- Registration
- Login
- Role authorization
- Duplicate rating behavior
- Rating updates
- Average rating calculations

These can be added as integration tests in a future iteration.

## Current UI Scope

The current frontend includes:

- Authentication flow
- Protected routes
- Admin dashboard
- Normal user store/rating interface
- Store owner dashboard
- Store search
- Rating submission and updates

The backend also provides admin filtering/sorting APIs and an individual user-details endpoint.

At present, the admin frontend does not expose separate controls for all API-level filtering/sorting functionality, and there is no dedicated frontend page for individual user details.

## Application Flow

```text
                    Login
                      │
                      ↓
               Authenticate User
                      │
                      ↓
                  Check Role
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
        ADMIN      NORMAL USER   STORE OWNER
          │           │           │
          ↓           ↓           ↓
       Admin       Store List    Owner
      Dashboard        │         Dashboard
          │            │           │
     ┌────┼────┐       ↓       ┌───┴────┐
     ↓    ↓    ↓     Rating    ↓        ↓
   Users Stores Stats         Average  Rated Users
```

## Security

The application implements basic security practices appropriate for the coding challenge:

- Passwords are hashed using bcrypt.
- JWT is used for authentication.
- Protected routes use authentication middleware.
- Role-based authorization is enforced on the backend.
- SQL queries use parameterized values.
- Passwords are not returned through API responses.
- JWT secrets and database credentials are stored in environment variables.
- Frontend route protection is not used as a replacement for backend authorization.
- Users can only modify their own ratings.
- Store owners can only access their own store's rating information.

## Challenge Requirements Covered

The implementation addresses the main requirements of the coding challenge, including:

- Three user roles
- Common login system
- Normal user registration
- Admin dashboard
- User and store management
- Store search
- Rating submission
- Rating modification
- Store-owner rating dashboard
- Password updates
- Input validation
- API-level filtering
- API-level sorting
- Role-based authorization
- Relational database design
- Secure password storage
- Logout
- Frontend and backend best practices

## Developer

**Abhishek Mukesh Solanki**

This project was developed as a full-stack coding challenge submission.
