# Pristine Flow - Smart Laundry System

A modern, high-performance laundry management platform built with React, Node.js, and Better Auth.

## 🚀 Key Features
- **Better Auth Integration**: Secure authentication with Google OAuth and Email/Password.
- **Real-time Monitoring**: Socket.io integration for order status and machinery updates.
- **Role-based Access**: Admin, Staff, and Customer specific interfaces and permissions.
- **Premium UI**: Dark-themed, high-contrast design with micro-animations.

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Recharts, Tailwind CSS.
- **Backend**: Node.js, Express, Better Auth, Socket.io, Postgres (via `pg`).
- **Database**: PostgreSQL (hosted on Supabase, accessed via direct pool).

## ⚙️ Environment Configuration

### Backend (.env)
```env
PORT=5002
TRANSACTION_URL=postgresql://...
FRONTEND_URL=http://localhost:5173
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=http://localhost:5002/api/auth
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
RESEND_API_KEY=your_key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5002
```

## 📜 Development
1. Install dependencies `npm install`.
2. Start the backend: `npm run dev` in `/laundry-backend`.
3. Start the frontend: `npm run dev` in `/pristine_flow_app`.

## 🛡️ Authentication Protocol
This system uses **Better Auth** as the single source of truth for all identity management. Legacy Supabase Auth has been completely decommissioned.
