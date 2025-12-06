# Egyptian Premier League Match Reservation System

## Overview

This is a full-stack web application for reserving seats at Egyptian Premier League football matches. The system supports role-based access for admins, EFA managers, and fans, providing stadium management, match scheduling, seat reservation, and user approval workflows.

The application uses a modern TypeScript stack with React on the frontend, Express on the backend, and PostgreSQL for data persistence. It features a Material Design-inspired UI built with shadcn/ui components and Tailwind CSS, emphasizing clarity and efficient workflows for sports ticketing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, bundled using Vite for fast development and optimized production builds.

**Routing**: Uses Wouter for lightweight client-side routing with role-based route protection.

**State Management**: 
- TanStack Query (React Query) for server state management and caching
- React Context for authentication state and theme management
- React Hook Form for form state with Zod validation

**UI Component System**: 
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Material Design principles adapted for sports ticketing
- Responsive design with mobile-first approach

**Authentication Flow**: 
- Session-based authentication with localStorage persistence
- Protected routes based on user role (admin, manager, fan)
- Account approval workflow requiring admin/manager approval before access

**Key Pages**:
- Public: Home, Login, Register, Match Listings, Match Details
- Customer: Dashboard with reservations, Profile, Match Reservation (seat selection + payment)
- Manager: Dashboard, Match Management (CRUD), Stadium Management (CRUD)
- Admin: Dashboard, User Management (approval/rejection)

### Backend Architecture

**Framework**: Express.js with TypeScript for RESTful API endpoints.

**Session Management**: 
- Express-session with MemoryStore (development) or connect-pg-simple (production)
- Session-based authentication stored in database or memory

**API Structure**:
- `/api/auth/*` - Authentication endpoints (login, logout, register, profile updates)
- `/api/users/*` - User management (admin only)
- `/api/stadiums/*` - Stadium CRUD operations (manager/admin only)
- `/api/matches/*` - Match CRUD and listing endpoints
- `/api/reservations/*` - Seat reservation and cancellation

**Authorization Middleware**:
- `requireAuth` - Validates user session exists
- `requireApproved` - Ensures user account is approved
- `requireRole(...roles)` - Restricts access to specific user roles

**Business Logic**:
- Conflict detection for stadium availability (prevents double-booking venues)
- Seat reservation validation (checks availability before confirming)
- Unique ticket number generation for each reservation
- User approval workflow (pending → approved/rejected)

### Data Storage

**ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database queries.

**Database Schema** (defined in `shared/schema.ts`):

**Users Table**:
- Fields: id, username, password (hashed), firstName, lastName, birthDate, gender, city, address, email, role, status
- Roles: admin, manager, fan
- Statuses: pending, approved, rejected
- Constraints: Unique username and email

**Stadiums Table**:
- Fields: id, name, rows, seatsPerRow
- Validation: 1-50 rows, 1-100 seats per row

**Matches Table**:
- Fields: id, homeTeam, awayTeam, dateTime, stadiumId, mainReferee, linesmen (array)
- Relationships: Foreign key to stadiums table
- Teams: Predefined list of 18 Egyptian Premier League teams

**Reservations Table**:
- Fields: id, userId, matchId, seatRow, seatNumber, ticketNumber, createdAt
- Relationships: Foreign keys to users and matches
- Constraints: Unique combination of (matchId, seatRow, seatNumber)

**Storage Interface** (`server/storage.ts`):
- Abstraction layer for database operations
- Supports in-memory implementation (development) and PostgreSQL (production)
- Methods for CRUD operations on all entities
- Specialized queries: conflict detection, seat availability, user reservations

### Design System

**Typography**: 
- Primary: Inter for forms, data, and body text
- Accent: Poppins for headings and CTAs

**Color System**:
- Semantic color tokens using HSL
- Light/dark theme support with CSS variables
- Primary: Green (#2D8B4E - Egyptian football colors)
- Accent colors for status badges and CTAs

**Component Patterns**:
- Consistent spacing using Tailwind scale (2, 4, 6, 8)
- Elevation system with shadows for cards and popovers
- Interactive states (hover, active) with subtle elevations
- Role-based visual hierarchy in dashboards

**Seat Map Component**:
- Interactive grid visualization of stadium seats
- Color-coded states: available (gray), reserved (red), selected (green), user's seats (blue)
- Click-to-select functionality with multi-seat support
- Responsive layout adapting to stadium dimensions

## External Dependencies

### UI Libraries
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-built component library with Tailwind styling
- **Lucide React**: Icon system
- **Tailwind CSS**: Utility-first CSS framework

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation for forms and API payloads
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### Data Fetching
- **TanStack Query**: Server state management and caching
- **date-fns**: Date formatting and manipulation

### Backend Services
- **Drizzle ORM**: Type-safe database queries
- **Express Session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **Vite**: Frontend build tool
- **esbuild**: Backend bundler for production
- **TypeScript**: Type safety across the stack

### Database
- **PostgreSQL**: Primary data store (configured via DATABASE_URL environment variable)
- Connection managed through Drizzle ORM with connection pooling

### Google Fonts
- Inter and Poppins font families loaded from Google Fonts CDN