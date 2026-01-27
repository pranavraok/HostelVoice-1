# Backend Setup & First Run Guide

## ✅ What's Fixed

You were getting `"Cannot GET /docs"` error because the backend didn't have a root route or documentation endpoint.

**✅ Added:**

- **`GET /`** - Root endpoint with API overview
- **`GET /health`** - Health check (already existed)
- **`GET /docs`** - API documentation endpoint

---

## 🚀 Quick Start

### 1. Start the Backend

From `backend/` directory:

```bash
npm run dev
```

You should see:

```
🏠 HostelVoice Backend Server

Environment: development
Port: 3001
URL: http://localhost:3001

Ready to accept connections...
```

### 2. Test the Endpoints

**Option A: Browser**

- Open [http://localhost:3001](http://localhost:3001) - See API overview
- Open [http://localhost:3001/health](http://localhost:3001/health) - See health check
- Open [http://localhost:3001/docs](http://localhost:3001/docs) - See full documentation

**Option B: Terminal (curl)**

```bash
# Root endpoint
curl http://localhost:3001

# Health check
curl http://localhost:3001/health

# Documentation
curl http://localhost:3001/docs
```

---

## 📋 Root Endpoint Response

```json
{
  "success": true,
  "message": "HostelVoice API",
  "version": "1.0.0",
  "status": "running",
  "docs": "/docs",
  "health": "/health",
  "timestamp": "2026-01-27T..."
}
```

---

## 📚 Documentation Endpoint

`GET http://localhost:3001/docs` returns:

- All available modules and their endpoints
- Authentication requirements
- Links to Postman collection
- Testing guide location

---

## 🔗 Next Steps: Testing with Postman

1. **Get your Supabase token:**
   - Open frontend at `http://localhost:3000`
   - Log in as a test user
   - Open DevTools Console
   - Paste: `const session = await supabase.auth.getSession(); console.log(session.data.session.access_token);`
   - Copy the token

2. **Import Postman Collection:**
   - Open Postman
   - Click File → Import
   - Select `HostelVoice_Backend_API.postman_collection.json` (in backend folder)
   - Create Environment → Add `token` variable with your token

3. **Start Testing:**
   - Click "Health Check" request → Send
   - Try "Create Issue" with your token
   - Test all modules

---

## ✨ Available Endpoints Overview

| Endpoint               | Method                | Auth Required | Purpose             |
| ---------------------- | --------------------- | ------------- | ------------------- |
| `/`                    | GET                   | No            | API overview        |
| `/health`              | GET                   | No            | Server health check |
| `/docs`                | GET                   | No            | API documentation   |
| `/api/issues/*`        | GET/POST/PATCH        | Yes           | Issue management    |
| `/api/announcements/*` | GET/POST/PATCH/DELETE | Yes           | Announcements       |
| `/api/lostfound/*`     | GET/POST/PATCH        | Yes           | Lost & found        |
| `/api/residents/*`     | GET/POST/PATCH        | Yes           | Resident info       |
| `/api/notifications/*` | GET/PATCH             | Yes           | Notifications       |
| `/api/analytics/*`     | GET                   | Yes           | Analytics           |
| `/api/admin/*`         | GET/PATCH             | Yes (Admin)   | Admin functions     |
| `/api/upload/*`        | GET/POST/DELETE       | Yes           | File uploads        |

---

## 🔐 Authentication

All `/api/*` endpoints require:

**Header:**

```
Authorization: Bearer <your-supabase-access-token>
```

**Example:**

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  http://localhost:3001/api/issues
```

---

## 🐛 Troubleshooting

### "Cannot connect to localhost:3001"

- Check if backend is running: `npm run dev` in backend folder
- Check if port 3001 is available: `netstat -ano | findstr :3001` (Windows)
- Try restarting the dev server

### "Invalid or expired token"

- Get a new token from the frontend
- Make sure to include "Bearer " prefix in Authorization header
- Check token is copied exactly without extra spaces

### "User is not approved"

- This is expected for new student/caretaker accounts
- Log in as Admin to approve users, OR
- Go to Supabase Dashboard → Admin Users to manually approve

### "CORS error"

- Make sure frontend is running on `http://localhost:3000`
- Check `.env` file has correct `FRONTEND_URL`

---

## 🎯 Now You're Ready!

✅ Backend is running at `http://localhost:3001`
✅ All endpoints are accessible
✅ Documentation is available
✅ Ready to test with Postman

**Next:** Follow [POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md) to test all endpoints!
