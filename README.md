# Destina AI

Destina AI is a production-ready travel itinerary planner web application with FastAPI backend and React + Tailwind frontend.

## Tech Stack

- Backend: Python 3.11, FastAPI, Uvicorn, SQLAlchemy 2.0, SQLite, Passlib (bcrypt), Python-Jose, Pydantic v2, ReportLab
- Frontend: React 18 (Vite), Tailwind CSS 3, Framer Motion, Axios, Chart.js 4

## Project Structure

```text
destina-ai/
  backend/
  frontend/
  README.md
```

## Backend Setup

1. `cd backend`
2. `python -m venv venv`
3. Activate virtual environment:
   - Linux/macOS: `source venv/bin/activate`
   - Windows: `venv\\Scripts\\activate`
4. `pip install -r requirements.txt`
5. `uvicorn main:app --reload`

Backend URL: `http://127.0.0.1:8000`

## Frontend Setup

1. `cd frontend`
2. `npm install`
3. `npm run dev`

Frontend URL: `http://localhost:5173`

## Key Features

- JWT-based authentication (`/register`, `/login`)
- AI-style itinerary generation (`/create-itinerary`)
- Analytics endpoints (`/stats/users`, `/stats/destinations`, `/stats/budgets`)
- PDF itinerary export (`/download-itinerary/{id}`)
- Animated startup-style landing page sections
- Admin dashboard with charts and recent itineraries table
- Dark/Light mode toggle
- Responsive mobile-first UI
