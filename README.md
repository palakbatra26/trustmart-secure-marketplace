# TrustMarket -

## Overview
Full-stack MERN marketplace with MongoDB Atlas, React + Tailwind frontend, and Express backend.

## Quick Start

### 1. Backend (MongoDB Server)
```bash
cd trustmart-secure-marketplace
cd server
npm install
npm start
```
Server runs on http://localhost:5000

### 2. Frontend (React)
```bash
cd trustmart-secure-marketplace
npm install
npm run dev
```
Frontend runs on http://localhost:3000 (or next available port)

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```


## API Endpoints

### Auth
- POST /api/auth/register - Register user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Products
- GET /api/products - List all products
- GET /api/products/:id - Get product
- POST /api/products - Create product
- PUT /api/products/:id - Update product
- DELETE /api/products/:id - Delete product

### Users
- GET /api/users - List users (admin)
- GET /api/users/:id - Get user profile
- PUT /api/users/:id - Update profile

### Comments
- GET /api/comments/product/:productId
- POST /api/comments
- DELETE /api/comments/:id

### Reports
- POST /api/reports
- GET /api/reports (admin)

## Tech Stack
- Frontend: React + Tailwind + TanStack Router
- Backend: Express + MongoDB (Mongoose)
- Database: MongoDB Atlas
- Auth: JWT
