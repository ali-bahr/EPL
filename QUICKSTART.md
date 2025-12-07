# Quick Start Guide

## First Time Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment (optional):**
   
   For local development with mock server, the defaults work out of the box. If you need to customize:
   
   ```bash
   # Copy the example file
   cp .env.example .env.development
   
   # Edit .env.development if needed
   ```

3. **Run the application:**

   ### Option A: Full Stack (Client + Server)
   ```bash
   npm run dev:all
   ```
   - Server: http://localhost:5000
   - Client: http://localhost:5173

   ### Option B: Server Only
   ```bash
   npm run dev:server
   ```

   ### Option C: Client Only (with remote backend)
   ```bash
   # First, set your backend URL in .env.development
   # VITE_API_BASE_URL=https://your-backend.com
   
   npm run dev:client
   ```

## Connecting to a Remote Backend

1. Create or edit `.env.development`:
   ```env
   VITE_API_BASE_URL=https://your-remote-backend.com
   VITE_SOCKET_URL=https://your-remote-backend.com
   ```

2. Run the client:
   ```bash
   npm run dev:client
   ```

## Building for Production

### Build Everything
```bash
npm run build
```

### Build Client Only
```bash
npm run build:client
```

The built files will be in `dist/public/` and can be deployed to any static hosting service.

## Troubleshooting

### Client can't connect to server
- Check that the server is running on the correct port
- Verify the `VITE_API_BASE_URL` in your environment file
- Check browser console for CORS errors

### WebSocket connection fails
- Ensure `VITE_SOCKET_URL` matches your server URL
- Check that the server's Socket.IO configuration allows your client origin

### Environment variables not working
- Environment variable names must start with `VITE_`
- Restart the dev server after changing `.env` files
- Check you're editing the correct `.env` file for your mode

## What Changed?

Your client is now **fully decoupled** from the server:

✅ Client can run on any port (default: 5173)  
✅ Server can run on any port (default: 5000)  
✅ Client can connect to remote backends  
✅ Multiple deployment options available  
✅ Environment-based configuration  

## Need Help?

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.
