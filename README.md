# Ordinal Frontend

React + Vite frontend for Ordinal credit card rewards recommendation platform. It handles user login, dashboard, cards, transactions, and rewards views.

## Tech Stack

- React (with hooks and React Router)
- Vite for build tooling and dev server
- Fetch API for HTTP requests
- Custom AuthContext for JWT-based authentication

## Prerequisites

- Node.js (LTS) and npm installed
- Ordinal backend API running locally (use localhost or Render once deployed live)

## Project Structure

Top-level frontend files and folders:

- `App.jsx` – Main application component and routing shell  
- `App.css` – Global app-specific styles  
- `index.css` – Base/global styles  
- `main.jsx` – React entry point (mounts the app, sets up router/context)  
- `assets/` – Static assets (images, icons, etc.)  
- `components/` – Reusable presentational and UI components  
- `context/` – Context providers, including `useAuth` for authentication state  
- `pages/` – Route-level pages (e.g., `Login.jsx`, `Dashboard.jsx`, `CardDetail.jsx`)  

## Environment Variables

- `VITE_API_URL` – Base URL for the backend API  
  - Example (local): `http://localhost:5000/api`  
  - Example (Render): `https://your-backend.onrender.com/api`  

## Authentication

- Users log in with email and password.  
- On successful login, the backend returns a user object and JWT token.  
- The token is stored in AuthContext and sent as an `Authorization: Bearer <token>` header on protected requests.

## Quick Local Setup

1. **Clone & Install**
   ```bash
   git clone <your-frontend-repo>
   cd ordinal-frontend
   npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
Must also set up backend for this to work, see backend repo




