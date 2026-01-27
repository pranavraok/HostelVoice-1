# HostelVoice Backend API

Production-grade REST API backend for the HostelVoice hostel management system.

## 🚀 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Supabase** - PostgreSQL + Auth + Storage
- **Zod** - Runtime validation
- **JWT** - Authentication via Supabase access tokens

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts              # Environment configuration
│   │   ├── supabaseClient.ts   # Supabase admin client
│   │   └── index.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts   # JWT verification
│   │   ├── roleMiddleware.ts   # Role-based access control
│   │   ├── errorHandler.ts     # Global error handling
│   │   └── index.ts
│   ├── routes/
│   │   ├── issues.routes.ts
│   │   ├── announcements.routes.ts
│   │   ├── lostfound.routes.ts
│   │   ├── residents.routes.ts
│   │   ├── notifications.routes.ts
│   │   ├── analytics.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── upload.routes.ts
│   │   └── index.ts
│   ├── controllers/
│   │   ├── issues.controller.ts
│   │   ├── announcements.controller.ts
│   │   ├── lostfound.controller.ts
│   │   ├── residents.controller.ts
│   │   ├── notifications.controller.ts
│   │   ├── analytics.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── upload.controller.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── audit.service.ts        # Audit logging
│   │   ├── notification.service.ts # Notification management
│   │   ├── fileUpload.service.ts   # Supabase storage
│   │   ├── duplicateMerge.service.ts # Issue merging
│   │   └── index.ts
│   ├── utils/
│   │   ├── response.ts         # Response helpers
│   │   ├── validators.ts       # Zod schemas
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
├── .env                        # Environment variables
├── .env.example                # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase project with database set up

### Installation

1. **Navigate to backend directory**

```bash
cd backend
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
PORT=3001
NODE_ENV=development

# Get these from Supabase Dashboard → Settings → API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

FRONTEND_URL=http://localhost:3000
```

4. **Run database migrations**

In Supabase SQL Editor, run:

- `supabase-schema.sql` (main schema)
- `backend/approval-system-schema.sql` (approval fields)

5. **Start development server**

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

### Authentication

All API endpoints (except `/health`) require a valid Supabase access token.

```bash
Authorization: Bearer <supabase_access_token>
```

### Endpoints

#### Health Check

```
GET /health
```

---

### Issues API

| Method | Endpoint                     | Description         | Access      |
| ------ | ---------------------------- | ------------------- | ----------- |
| POST   | `/api/issues`                | Create new issue    | All users   |
| GET    | `/api/issues/my`             | Get my issues       | All users   |
| GET    | `/api/issues`                | Get all issues      | Staff       |
| GET    | `/api/issues/:id`            | Get issue by ID     | Owner/Staff |
| PATCH  | `/api/issues/:id/assign`     | Assign to caretaker | Staff       |
| PATCH  | `/api/issues/:id/status`     | Update status       | Staff       |
| POST   | `/api/issues/merge`          | Merge duplicates    | Staff       |
| GET    | `/api/issues/:id/duplicates` | Find duplicates     | Staff       |

---

### Announcements API

| Method | Endpoint                        | Description                | Access        |
| ------ | ------------------------------- | -------------------------- | ------------- |
| POST   | `/api/announcements`            | Create announcement        | Staff         |
| GET    | `/api/announcements`            | Get targeted announcements | All users     |
| GET    | `/api/announcements/all`        | Get all announcements      | Staff         |
| GET    | `/api/announcements/:id`        | Get by ID                  | All users     |
| PATCH  | `/api/announcements/:id`        | Update announcement        | Creator/Admin |
| DELETE | `/api/announcements/:id`        | Delete announcement        | Creator/Admin |
| PATCH  | `/api/announcements/:id/toggle` | Toggle active status       | Staff         |

---

### Lost & Found API

| Method | Endpoint                   | Description    | Access      |
| ------ | -------------------------- | -------------- | ----------- |
| POST   | `/api/lostfound`           | Report item    | All users   |
| GET    | `/api/lostfound`           | Get open items | All users   |
| GET    | `/api/lostfound/my`        | Get my reports | All users   |
| GET    | `/api/lostfound/all`       | Get all items  | Staff       |
| GET    | `/api/lostfound/:id`       | Get by ID      | All users   |
| PATCH  | `/api/lostfound/:id/claim` | Claim item     | All users   |
| PATCH  | `/api/lostfound/:id/close` | Close item     | Owner/Staff |

---

### Residents API

| Method | Endpoint                      | Description        | Access    |
| ------ | ----------------------------- | ------------------ | --------- |
| POST   | `/api/residents`              | Add/update profile | All users |
| GET    | `/api/residents/me`           | Get my profile     | All users |
| PATCH  | `/api/residents/me`           | Update my profile  | All users |
| GET    | `/api/residents`              | Get all residents  | Staff     |
| GET    | `/api/residents/:id`          | Get by ID          | Staff     |
| GET    | `/api/residents/user/:userId` | Get by user ID     | Staff     |
| PATCH  | `/api/residents/:id`          | Update resident    | Staff     |
| GET    | `/api/residents/hostel/:name` | Get by hostel      | Staff     |

---

### Notifications API

| Method | Endpoint                      | Description       | Access    |
| ------ | ----------------------------- | ----------------- | --------- |
| GET    | `/api/notifications`          | Get notifications | All users |
| GET    | `/api/notifications/count`    | Get unread count  | All users |
| PATCH  | `/api/notifications/read`     | Mark as read      | All users |
| PATCH  | `/api/notifications/read-all` | Mark all as read  | All users |

---

### Analytics API

| Method | Endpoint                            | Description        | Access |
| ------ | ----------------------------------- | ------------------ | ------ |
| GET    | `/api/analytics/dashboard`          | Dashboard stats    | Staff  |
| GET    | `/api/analytics/issues-summary`     | Issue statistics   | Staff  |
| GET    | `/api/analytics/resolution-time`    | Resolution times   | Staff  |
| GET    | `/api/analytics/category-frequency` | Category breakdown | Staff  |
| GET    | `/api/analytics/hostel-density`     | Issues by hostel   | Admin  |
| GET    | `/api/analytics/status-trends`      | Status over time   | Staff  |

---

### Admin API

| Method | Endpoint                   | Description           | Access |
| ------ | -------------------------- | --------------------- | ------ |
| GET    | `/api/admin/pending-users` | Get pending approvals | Admin  |
| PATCH  | `/api/admin/approve-user`  | Approve user          | Admin  |
| PATCH  | `/api/admin/reject-user`   | Reject user           | Admin  |
| GET    | `/api/admin/users`         | Get all users         | Admin  |
| GET    | `/api/admin/users/:id`     | Get user by ID        | Admin  |
| GET    | `/api/admin/audit-logs`    | Get audit logs        | Admin  |
| GET    | `/api/admin/stats`         | System statistics     | Admin  |
| GET    | `/api/admin/hostels`       | List hostels          | Admin  |

---

### Upload API

| Method | Endpoint                       | Description      | Access      |
| ------ | ------------------------------ | ---------------- | ----------- |
| POST   | `/api/upload/signed-url`       | Get upload URL   | All users   |
| POST   | `/api/upload/download-url`     | Get download URL | All users   |
| GET    | `/api/upload/public-url`       | Get public URL   | All users   |
| DELETE | `/api/upload/file`             | Delete file      | Owner/Staff |
| GET    | `/api/upload/my-files/:bucket` | List my files    | All users   |

---

## 🔐 Security Features

- **JWT Verification** - All requests verified via Supabase
- **Role-Based Access** - Student, Caretaker, Admin roles
- **Rate Limiting** - Configurable request limits
- **Helmet** - Security headers
- **CORS** - Configurable allowed origins
- **Input Validation** - Zod schema validation
- **Audit Logging** - All actions logged

## 🔄 How It Works With Frontend

```
Frontend (Next.js)              Backend (Express)
     │                                │
     │  1. User logs in via Supabase  │
     │ ─────────────────────────────► │
     │                                │
     │  2. Frontend gets access token │
     │ ◄───────────────────────────── │
     │                                │
     │  3. API call with Bearer token │
     │ ─────────────────────────────► │
     │                                │
     │  4. Backend verifies with      │
     │     Supabase, gets user data   │
     │                                │
     │  5. Response with data         │
     │ ◄───────────────────────────── │
```

## 📝 Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Description of result",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Stack trace (dev only)"
}
```

## 🧪 Testing

### Using cURL

```bash
# Health check
curl http://localhost:3001/health

# Create issue (with auth)
curl -X POST http://localhost:3001/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Broken AC in Room 101",
    "description": "The AC is not cooling properly",
    "category": "maintenance",
    "priority": "high"
  }'
```

### Using Frontend

The frontend will automatically include the auth token from Supabase session.

## 📦 Production Build

```bash
# Build
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Environment Variables for Production

```env
PORT=3001
NODE_ENV=production
SUPABASE_URL=your_production_url
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
FRONTEND_URL=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Deploy to Railway/Render/Fly.io

1. Push to GitHub
2. Connect repository
3. Set environment variables
4. Deploy

## 📄 License

MIT License
