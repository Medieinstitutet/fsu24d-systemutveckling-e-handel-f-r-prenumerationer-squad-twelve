# 📰 The Daily Dose – Subscription-Based News Platform

This project is a full-stack application built with TypeScript. It powers **The Daily Dose**, a subscription-based platform offering tiered access to news content.

---

## 📁 Project Structure

```
project-root/
├── backend/                 # Express API built in TypeScript
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── routes/
│       │   └── auth.ts
│       ├── controllers/
│       │   └── authController.ts
│       └── utils/
└── frontend/                # Frontend (planned using React + Vite)
```

---

## 🚀 Initial Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Medieinstitutet/fsu24d-systemutveckling-e-handel-f-r-prenumerationer-squad-twelve
cd backend
```

### 2. Initialize the Backend Project

```bash
npm init -y
```

### 3. Create `.env` File

```bash
# backend/.env
PORT=
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
```

### 4. Install Dependencies

```bash
# Base packages
npm install express mysql2 stripe jsonwebtoken bcryptjs dotenv cors

# TypeScript + runtime
npm install typescript ts-node-dev

# Dev-only tools and types
npm install --save-dev nodemon @types/node @types/express @types/bcryptjs @types/cors
```

### 5. Run the Server (Development)

```bash
npm run dev
```

Server will run on `http://localhost:3000`.

---

## 🛠 Backend Requirements

- Node.js 18+
- MySQL (local or cloud)
- Stripe CLI (optional, for webhook handling)
- TypeScript + ts-node-dev

---

## 🧪 Test the Auth API (Backend)

You can use [Postman](https://www.postman.com/) or curl:

- `POST /auth/register`  
  JSON body: `{ "email": "test@test.com", "password": "123456" }`

- `POST /auth/login`  
  JSON body: `{ "email": "test@test.com", "password": "123456" }`

---

## 📄 .gitignore

```gitignore
node_modules/
dist/
.env
```

---

## 🌐 Frontend Roadmap

The frontend will be built using **React + Vite** and will include:

1. **Public pages**: Home, Login, Register
2. **Authenticated dashboard**: Shows user-specific content based on their subscription level
3. **Stripe Checkout integration**: Connects to backend to initiate subscriptions
4. **Upgrade/downgrade flow**: Users can change their subscription level
5. **Logout and session management**
6. **Dark mode + responsive design**

Folder will be: `/frontend`

---

## 📌 Next Steps

- [ ] Connect backend to MySQL
- [ ] Create protected routes and middleware
- [ ] Add Stripe product subscriptions
- [ ] Build frontend pages and connect to API
- [ ] Deploy backend (e.g., Railway, Aiven) and frontend (e.g., Vercel)

---

## 📜 License

MIT
