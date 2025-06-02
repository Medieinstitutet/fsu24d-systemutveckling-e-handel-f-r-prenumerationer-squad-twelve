## 🧑‍🤝‍🧑 Backend Auth & DB Setup – Developer Notes (Base Implementation)

This section summarizes the parts of the backend setup completed.

### ✅ Completed Features

- [x] Project structure and TypeScript config (`tsconfig.json`)
- [x] Express server initialized in `src/index.ts`
- [x] Routes created: `/auth/register`, `/auth/login`, `/protected/me`
- [x] JWT authentication with `requireAuth` middleware
- [x] Password hashing using `bcryptjs`
- [x] User storage in MySQL via XAMPP (`users` table with hashed passwords)
- [x] Environment config using `.env`
- [x] Modularized controllers and middleware
- [x] Protected route example implemented and tested

---

### 🧪 How to Test

1. Register a user:

```
POST /auth/register
{
  "email": "test@example.com",
  "password": "123456"
}
```

2. Login to get JWT token:

```
POST /auth/login
{
  "email": "test@example.com",
  "password": "123456"
}
```

3. Access protected route:

```
GET /protected/me
Authorization: Bearer <your_token_here>
```

---

### 🧼 Code Comments & Structure Review

✅ Each file follows this style:

- `controllers/`: for route logic (e.g. `authController.ts`)
- `routes/`: for API route definitions
- `utils/db.ts`: handles DB connection
- `middleware/authMiddleware.ts`: secures protected routes

📌 All critical routes and logic are commented:

- Input validation
- Password hashing / comparison
- JWT signing / verification
- User DB queries

---

### 📝 Next Developer Instructions

- You can add new routes by extending the router in `/routes`
- DB queries should use the `db` pool from `utils/db.ts`
- Use `requireAuth` to protect any routes that need login
- JWT payload includes `id`, `email`, and `subscription_level`

---

### ℹ️ Dependencies

All dependencies are declared in `backend/package.json`, including:

- `express`, `dotenv`, `cors`
- `mysql2`, `bcryptjs`, `jsonwebtoken`
- TypeScript types + `ts-node-dev` for dev

---

This setup is complete and working under XAMPP for local MySQL. Can be swapped to Aiven later by updating `.env` and enabling SSL in `db.ts`.
