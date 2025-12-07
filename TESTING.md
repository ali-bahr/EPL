# Testing the Decoupled Setup

## Test 1: Verify Client Can Run Standalone

1. Make sure server is running:
   ```bash
   npm run dev:server
   ```

2. In a new terminal, run client:
   ```bash
   npm run dev:client
   ```

3. Open browser to `http://localhost:5173`
4. Client should connect to server at `http://localhost:5000`

**Expected Result**: ✅ Client loads and connects to API

---

## Test 2: Verify Concurrent Mode

1. Stop all running processes
2. Run both together:
   ```bash
   npm run dev:all
   ```

**Expected Result**: ✅ Both server and client start simultaneously

---

## Test 3: Test API Configuration

1. Check the browser console (F12)
2. Look for any API errors or connection issues
3. Try logging in or making an API call

**Expected Result**: ✅ API calls go to correct backend URL

---

## Test 4: Test WebSocket Connection

1. Open browser console
2. Look for Socket.IO connection logs
3. Should see "Socket connected: [id]"

**Expected Result**: ✅ WebSocket connects successfully

---

## Test 5: Environment Variable Override

1. Create `.env.development.local`:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

2. Run client:
   ```bash
   npm run dev:client
   ```

3. Check browser Network tab - API calls should go to port 3000

**Expected Result**: ✅ Client uses overridden URL

---

## Test 6: Production Build

1. Build the client:
   ```bash
   npm run build:client
   ```

2. Preview the build:
   ```bash
   npm run preview
   ```

**Expected Result**: ✅ Client builds successfully, preview works

---

## Troubleshooting

### Issue: CORS errors
**Solution**: The Vite proxy should handle this in development. For production, ensure server has proper CORS configuration.

### Issue: WebSocket connection fails
**Solution**: Check `VITE_SOCKET_URL` matches your server URL.

### Issue: API calls fail with 404
**Solution**: Verify `VITE_API_BASE_URL` is correct and server is running.

### Issue: Environment variables not working
**Solution**: 
- Restart dev server after changing .env files
- Ensure variable names start with `VITE_`
- Check you're editing the right .env file

---

## Verification Checklist

After running tests, verify:

- [ ] Client runs on port 5173
- [ ] Server runs on port 5000
- [ ] Client can connect to API endpoints
- [ ] WebSocket connection works
- [ ] Login/auth flow works
- [ ] Environment variables can be changed
- [ ] Production build works
- [ ] Concurrent mode works

---

## Configuration Test

Run this in browser console to verify config:

```javascript
// Check what the client sees
console.log('Import meta env:', import.meta.env);
console.log('API Base:', import.meta.env.VITE_API_BASE_URL);
console.log('Socket URL:', import.meta.env.VITE_SOCKET_URL);
```

Expected output should show your configured URLs.
