# Skycast Weather App

Skycast is a full-stack weather application that provides real-time weather data, 5-day forecasts, and interactive maps. It allows users to create accounts, save their weather search history, and export their records. It also integrates with Wikipedia to provide contextual information about searched locations.

## Features

- **Real-time Weather & 5-Day Forecast**: Get precise current weather conditions and daily forecasts.
- **Interactive Weather Map**: View locations and weather visualizations using Leaflet.
- **Search History**: Authenticated users can securely save and view their past searches.
- **Export Data**: Download your weather search history in various formats (e.g., CSV, JSON).
- **Location Context**: Learn more about destinations with built-in Wikipedia summaries.
- **Secure Authentication**: User registration and login using JSON Web Tokens (JWT) and Bcrypt.

## Tech Stack

### Frontend

- **Framework**: Next.js (App Router)
- **UI Library**: React
- **Styling**: Tailwind CSS
- **Maps**: Leaflet & React-Leaflet
- **Language**: TypeScript

### Backend

- **Framework**: Express.js (Node.js)
- **Database ORM**: Prisma
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT & Bcryptjs
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in `backend/.env`:
   ```env
   DATABASE_URL="your-postgresql-url"
   JWT_SECRET="your-secret-key"
   CORS_ALLOWED_ORIGIN="http://localhost:3000"
   PORT=4000
   ```
4. Push the Prisma schema to your database:
   ```bash
   npx prisma db push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

# Skycast Weather App

Skycast is a full-stack weather application that provides real-time weather data, 5-day forecasts, and interactive maps. It allows users to create accounts, save their weather search history, and export their records. It also integrates with Wikipedia to provide contextual information about searched locations.

## Features

- **Real-time Weather & 5-Day Forecast**: Get precise current weather conditions and daily forecasts.
- **Interactive Weather Map**: View locations and weather visualizations using Leaflet.
- **Search History**: Authenticated users can securely save and view their past searches.
- **Export Data**: Download your weather search history in various formats (e.g., CSV, JSON).
- **Location Context**: Learn more about destinations with built-in Wikipedia summaries.
- **Secure Authentication**: User registration and login using JSON Web Tokens (JWT) and Bcrypt.

## Tech Stack

### Frontend

- **Framework**: Next.js (App Router)
- **UI Library**: React
- **Styling**: Tailwind CSS
- **Maps**: Leaflet & React-Leaflet
- **Language**: TypeScript

### Backend

- **Framework**: Express.js (Node.js)
- **Database ORM**: Prisma
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT & Bcryptjs
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in `.env`:
   ```env
   DATABASE_URL="your-postgresql-url"
   JWT_SECRET="your-secret-key"
   CORS_ALLOWED_ORIGIN="http://localhost:3000"
   PORT=4000
   ```
4. Push the Prisma schema to your database:
   ```bash
   npx prisma db push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.
