# Egyptian Premier League - Frontend

This is the frontend application for the Egyptian Premier League ticket booking system.

## Backend Integration

This application integrates with the backend API hosted at: `https://golazo.runasp.net`

The backend handles:
- User authentication (with cookie-based sessions)
- Match management
- Stadium management
- Ticket reservations
- Real-time seat updates via WebSocket

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=https://golazo.runasp.net
```

## Development

```bash
# Install dependencies
npm install

# Run development server (uses Vite proxy)
npm run dev
```

The development server runs on `http://localhost:5173` and proxies API requests to the backend.

## Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Cookie-Based Authentication

The application uses cookie-based authentication provided by the backend API. Cookies are automatically handled by the browser with `credentials: 'include'` in all fetch requests.

**Important**: Make sure the backend is configured to accept requests from your frontend domain with proper CORS settings including `credentials: true`.

## API Service Layer

All API calls are centralized in `client/src/lib/api.ts` with dedicated service functions:
- `authApi` - Authentication endpoints
- `matchApi` - Match management
- `stadiumApi` - Stadium management
- `reservationApi` - Reservation management
- `userApi` - User management

## WebSocket Integration

Real-time features use Socket.IO to connect to the backend for:
- Live seat availability updates
- Match status changes
- Reservation notifications

## Project Structure

```
client/
  src/
    components/     # Reusable UI components
    pages/         # Page components
    lib/           # API client, auth, utilities
    hooks/         # Custom React hooks
shared/          # Shared types and schemas
```

## Features

- User registration and authentication
- Browse matches and stadiums
- Real-time seat selection and booking
- User dashboard with reservation history
- Manager dashboard for match and stadium management
- Admin dashboard for user approval
- Responsive design with dark mode support
