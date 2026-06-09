# Egyptian Premier League Match Reservation System

A full-stack web application for reserving seats at Egyptian Premier League football matches. The system supports role-based access for **admins**, **EFA managers**, and **fans**, covering stadium management, match scheduling, interactive seat selection, and user approval workflows.

---

## Features

- **Role-based access control** — Admin, Manager, and Fan roles with distinct permissions and dashboards
- **Match management** — Create, update, and list matches with full referee and team info
- **Stadium management** — Define stadium capacity (rows × seats per row) with double-booking conflict detection
- **Interactive seat map** — Color-coded grid showing available, reserved, selected, and user-owned seats
- **User approval workflow** — New fan accounts go through a pending → approved/rejected flow
- **Session-based authentication** — Secure login with hashed passwords and session persistence
- **Unique ticket numbers** — Auto-generated per reservation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Routing | Wouter |
| State / Data | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| UI | shadcn/ui, Radix UI, Tailwind CSS |
| Backend | Express.js, TypeScript |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Sessions | express-session + connect-pg-simple |

---

## Project Structure

```
EPL/
├── client/         # React frontend (Vite)
├── server/         # Express backend
├── shared/         # Shared schema (Drizzle + Zod types)
├── script/         # Utility scripts
├── attached_assets/
├── .env.example
├── .env.development
├── .env.production
├── drizzle.config.ts
├── vite.config.ts
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
git clone https://github.com/ali-bahr/EPL.git
cd EPL
npm install
```

### Environment Setup

```bash
cp .env.example .env.development
# Edit .env.development and set your DATABASE_URL
```

### Running the App

**Full stack (recommended):**
```bash
npm run dev:all
```
- Client: http://localhost:5173  
- Server: http://localhost:5000

**Server only:**
```bash
npm run dev:server
```

**Client only (against a remote backend):**
```bash
# Set VITE_API_BASE_URL in .env.development first
npm run dev:client
```

---

## Building for Production

```bash
npm run build
```

Client output lands in `dist/public/` and can be deployed to any static hosting service. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

---

## Database Schema

| Table | Key Fields |
|---|---|
| `users` | id, username, password (hashed), role (`admin`/`manager`/`fan`), status (`pending`/`approved`/`rejected`) |
| `stadiums` | id, name, rows (1–50), seatsPerRow (1–100) |
| `matches` | id, homeTeam, awayTeam, dateTime, stadiumId, mainReferee, linesmen |
| `reservations` | id, userId, matchId, seatRow, seatNumber, ticketNumber, createdAt |

Reservations enforce a unique constraint on `(matchId, seatRow, seatNumber)` to prevent double-booking.

---

## API Overview

| Prefix | Description | Access |
|---|---|---|
| `/api/auth/*` | Login, logout, register, profile | Public / Auth |
| `/api/users/*` | User management & approvals | Admin only |
| `/api/stadiums/*` | Stadium CRUD | Manager / Admin |
| `/api/matches/*` | Match listing and management | Public / Manager |
| `/api/reservations/*` | Seat reservation and cancellation | Approved fans |

---

## User Roles

- **Fan** — Browse matches, reserve/cancel seats (requires account approval)
- **Manager** — All fan permissions + create/edit matches and stadiums
- **Admin** — All manager permissions + approve/reject user accounts

---

## License

This project is open source. Feel free to fork and adapt.
