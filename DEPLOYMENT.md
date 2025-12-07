# EPL - Egyptian Premier League Booking System

## Architecture Overview

This project now has a **decoupled architecture** with separate client and server components:

- **Client**: React + Vite frontend application
- **Server**: Express.js backend with WebSocket support
- **Shared**: Common TypeScript schemas and types

## Running the Application

### Option 1: Run Everything Together (Development)

Run both client and server concurrently:

```bash
npm install
npm run dev:all
```

This will start:
- Server on `http://localhost:5000`
- Client on `http://localhost:5173`

### Option 2: Run Server Only

```bash
npm run dev:server
# or for production
npm run start:server
```

### Option 3: Run Client Only (Standalone)

The client can run independently and connect to any backend:

```bash
npm run dev:client
```

The client will connect to the backend URL specified in your `.env` file.

## Environment Configuration

### Development Setup (Local Server)

Create a `.env.development` file (already provided):

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Production Setup (Remote Backend)

Create a `.env.production` file with your remote backend URLs:

```env
VITE_API_BASE_URL=https://your-backend-api.com
VITE_SOCKET_URL=https://your-backend-api.com
```

### Environment Variables

- `VITE_API_BASE_URL`: Base URL for API requests
- `VITE_SOCKET_URL`: WebSocket/Socket.IO server URL (optional, defaults to API base URL)

## Project Structure

```
EPL/
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── config/
│   │   │   └── api.ts      # Centralized API configuration
│   │   ├── lib/
│   │   │   ├── auth.tsx    # Authentication context
│   │   │   ├── queryClient.ts  # API request utilities
│   │   │   └── socket.ts   # WebSocket client
│   │   ├── pages/          # React pages
│   │   └── components/     # React components
│   └── index.html
├── server/                  # Backend Express server
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   └── socket.ts           # WebSocket handlers
├── shared/                  # Shared types and schemas
│   └── schema.ts
├── .env.development        # Dev environment variables
├── .env.production         # Prod environment variables
└── package.json
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:all` | Run both client and server in development mode |
| `npm run dev:server` | Run only the server in development mode |
| `npm run dev:client` | Run only the client in development mode |
| `npm run build` | Build both client and server for production |
| `npm run build:client` | Build only the client |
| `npm run start:server` | Start the production server |
| `npm run preview` | Preview the production build locally |
| `npm run check` | Type-check the entire project |
| `npm run db:push` | Push database schema changes |

## Connecting to a Different Backend

To connect your client to a different backend:

1. Update the environment variables in `.env.production` or `.env.development`
2. Ensure your backend supports CORS for the client origin
3. Ensure session cookies are configured correctly for cross-origin requests
4. Build and deploy the client separately from the server

### Example: Deploying Client and Server Separately

**Backend Server:**
```bash
# Deploy to your backend hosting (e.g., Railway, Render, etc.)
npm run build
npm run start:server
```

**Frontend Client:**
```bash
# Set production environment variables
VITE_API_BASE_URL=https://your-backend.com npm run build:client

# Deploy the dist/public folder to static hosting
# (Netlify, Vercel, GitHub Pages, etc.)
```

## Development Workflow

### Local Development with Mock Server

```bash
npm run dev:all
```

Both client and server run locally. The client uses Vite's dev server with proxy configuration.

### Testing Against Remote Backend

```bash
# Update .env.development
VITE_API_BASE_URL=https://staging-api.example.com
VITE_SOCKET_URL=https://staging-api.example.com

npm run dev:client
```

The client runs locally but connects to a remote backend.

## API Configuration

All API and WebSocket URLs are managed through `client/src/config/api.ts`:

```typescript
import { getApiUrl, getSocketUrl } from '@/config/api';

// Use in your code
const url = getApiUrl('/api/auth/login');
const socketUrl = getSocketUrl();
```

This ensures consistent URL handling across the entire application.

## Migration Notes

The following changes were made to decouple the client from the server:

1. **Created centralized API configuration** (`client/src/config/api.ts`)
2. **Updated all fetch calls** to use `getApiUrl()` helper
3. **Updated WebSocket connection** to use environment configuration
4. **Added proxy configuration** in Vite for local development
5. **Separated npm scripts** for running client/server independently
6. **Created environment files** for different deployment scenarios

## CORS Configuration

If running the client and server on different domains, ensure your server has proper CORS configuration:

```typescript
// server/index.ts
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
```

## Next Steps

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.development` and configure for local development
3. Run the application: `npm run dev:all`
4. For production deployment, update `.env.production` with your backend URLs

## Support

For issues or questions, please check the documentation in the `/docs` folder or contact the development team.
