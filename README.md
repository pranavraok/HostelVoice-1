# 🏠 HostelVoice - Smart Hostel Management System

A comprehensive full-stack hostel management solution with **Next.js 16** frontend, **Express.js** backend API, and **Supabase** database. Features secure role-based authentication, real-time issue tracking, announcements, lost & found management, and analytics dashboard.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-green)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)

---

## ✨ Features

### 🔐 Authentication & Security

- **Simple Sign Up & Login** - Create your account and log in securely
- **Three User Types** - Student, Caretaker, and Admin roles with different access
- **Admin Approval System** - New students and caretakers need admin approval before accessing the system
- **Protected Pages** - Only logged-in users can access the dashboard
- **Automatic Login Refresh** - Stay logged in without re-entering password

---

## 👥 What Each User Can Do

### 🎓 Students Can:

1. **Report Problems** - Tell caretakers about broken items, cleaning issues, etc.
2. **Track Your Issues** - See if your problem is being fixed or already solved
3. **Read Announcements** - Stay updated with hostel news and important notices
4. **Lost & Found** - Report lost items or found items, search for your missing belongings
5. **View Your Profile** - See your hostel details and personal information
6. **Apply for Leave** - Request permission to leave hostel with dates and reason
7. **Track Leave Status** - Check if your leave is approved, rejected, or pending
8. **View Mess Menu** - See what food is being served this week
9. **Give Mess Feedback** - Rate meals and suggest improvements
10. **Personal Dashboard** - See all your activities in one place

### 🛠️ Caretakers Can:

1. **Manage Student Issues** - View all problems reported by students
2. **Assign Issues** - Give problems to staff members to fix
3. **Update Issue Status** - Mark issues as in-progress or resolved
4. **Post Announcements** - Send important updates to all students
5. **Manage Lost & Found** - Help students find their lost items
6. **View Student Info** - See details of students in your hostel
7. **Review Student Leaves** - Approve or reject leave requests from students
8. **Apply for Own Leave** - Request work leave and suggest replacement
9. **Track Own Leave** - Check if admin approved your leave
10. **Upload Mess Menu** - Add weekly food menu with all meals and upload menu card image
11. **View Mess Feedback** - See student ratings and respond to suggestions
12. **Caretaker Dashboard** - Monitor hostel activities and pending tasks

### 👔 Admins Can:

1. **Approve New Users** - Accept or reject student/caretaker registrations
2. **View All Issues** - See every problem reported across all hostels
3. **System Analytics** - View graphs and statistics of hostel activities
4. **Manage Users** - See all students and staff across all hostels
5. **Post System-Wide Announcements** - Send urgent messages to everyone
6. **Review Caretaker Leaves** - Approve/reject work leave from caretakers
7. **Assign Replacement Caretakers** - Ensure hostel is always staffed
8. **View Leave Calendar** - See who is on leave and when
9. **View All Mess Menus** - Monitor food quality across hostels
10. **Access Audit Logs** - Track all important actions in the system
11. **Admin Dashboard** - Complete overview with all metrics

---

## 🎯 Main Features Explained Simply

### 1. 📋 **Issue & Complaint Tracking**

**What it does**: Let students report problems, and staff can fix them

**How it works**:

- Student reports a problem (like "AC not working in Room 301")
- Choose category (maintenance, cleaning, security, facilities, other)
- Set priority (low, medium, high, urgent)
- Caretaker sees the issue and assigns it to someone
- Student gets updates when status changes
- Issue marked as resolved when fixed
- Everyone can see issue history and details

### 2. 📢 **Announcements**

**What it does**: Share important news with everyone in the hostel

**How it works**:

- Caretaker or admin writes announcement
- Choose who should see it (all students, only staff, or everyone)
- Pin important announcements to show at top
- Students see announcements on their dashboard
- Delete or edit announcements when needed

### 3. 🔍 **Lost & Found System**

**What it does**: Help students find lost items and return found items

**How it works**:

- Report lost item with description, when/where lost, contact info
- Report found item with description, when/where found, current location
- Browse all lost and found items (wallet, phone, keys, documents, bags, clothes, etc.)
- Contact the person who posted the item
- Mark item as claimed when owner found
- System shows smart matches for similar items
- All students can see all items for better chances of finding matches

### 4. 👥 **Resident Information**

**What it does**: Store and view student details

**How it works**:

- Students see their own profile with room number, hostel name, emergency contacts
- Caretakers see all students in their hostel
- Admins see all students across all hostels
- Search by name, room number, or student ID
- View contact information for emergencies

### 5. 📊 **Analytics Dashboard**

**What it does**: Show statistics and graphs about hostel activities

**What you see**:

- Total number of open issues, resolved issues
- How many announcements posted this month
- Lost & found items statistics
- Active users and approval statistics
- Beautiful charts and graphs
- Different data for each role (student/caretaker/admin)

### 6. ✅ **User Approval System**

**What it does**: Admins control who can join the system

**How it works**:

- New student/caretaker registers with details
- Admin sees pending approval requests
- Admin reviews details and approves or rejects
- Approved users can login and use the system
- Rejected users cannot access the dashboard
- Admins can add rejection reason

### 7. 🏖️ **Leave Application System**

#### For Students:

**What it does**: Request permission to leave hostel temporarily

**How it works**:

- Fill leave form with dates, destination, reason, contact during leave
- Submit to caretaker for approval
- Track status (pending, approved, rejected, more info needed)
- See caretaker's comments or rejection reason
- Get notification when status changes

#### For Caretakers:

**What it does**: Review student leaves AND apply for own work leave

**How it works**:

- **Review Student Leaves**: Approve/reject student leave requests, ask for more info if needed
- **Apply for Own Leave**: Request work leave from admin, suggest replacement caretaker, upload documents (medical certificate for sick leave)
- **Track Own Status**: See if admin approved your leave request

#### For Admins:

**What it does**: Manage caretaker leaves and ensure proper staffing

**How it works**:

- Review all caretaker leave requests
- Approve, conditionally approve, or reject
- Assign replacement caretaker for coverage
- View leave calendar to see staffing schedule
- Ensure hostels are never without caretaker supervision

### 8. 🍽️ **Mess Management System**

#### For Students:

**What it does**: View menu and give feedback on mess food

**How it works**:

- View weekly menu in calendar format (all 7 days)
- See breakfast, lunch, snacks, dinner for each day
- Download menu card image uploaded by caretaker
- Submit feedback after eating (rate meals, suggest changes)
- See caretaker's response to your feedback

#### For Caretakers:

**What it does**: Upload menus and handle student feedback

**How it works**:

- Upload menu card image (physical menu photo)
- Fill weekly menu for all days and meals
- Enter items as comma-separated (e.g., "Idli, Sambar, Chutney, Tea")
- System validates all meals are filled before saving
- View all student feedback submissions
- Respond to feedback and mark as reviewed
- See ratings and suggestions from students

#### For Admins:

**What it does**: Monitor mess operations across hostels

**How it works**:

- View all menus from all hostels
- See all student feedback and ratings
- Access mess analytics and reports
- Monitor food quality and student satisfaction
- Ensure caretakers are managing mess properly

### 9. 🔔 **Smart Notifications**

**What it does**: Keep you updated about important activities

**You get notified for**:

- When your reported issue is assigned to someone
- When your issue status changes (in-progress/resolved)
- When your leave is approved or rejected
- New announcements posted
- When someone finds an item matching your lost item report
- Important system updates

### 10. 📱 **Role-Based Dashboard**

**What it does**: Show different information based on who you are

**How it works**:

- Students see: My issues, announcements, lost items, mess menu, leave status
- Caretakers see: All issues to manage, student leaves to review, mess management, own leave status
- Admins see: All analytics, user approvals, system overview, caretaker leaves, mess monitoring
- Everyone sees only what they need - no confusion!

---

## 🔒 Security Features

- **Password Protection** - Your password is encrypted and secure
- **Role-Based Access** - You can only see and do what your role allows
- **Database Security** - Row-level security ensures data privacy
- **Audit Logs** - System tracks all important actions for accountability
- **Session Management** - Automatic logout after inactivity
- **Admin Controls** - Only admins can approve users and access sensitive data

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Supabase account

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd HostelVoice
```

2. **Install frontend dependencies**

```bash
npm install
```

3. **Install backend dependencies**

```bash
cd backend
npm install
cd ..
```

4. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your credentials from Settings → API
   - Copy your Service Role key (for backend) from Settings → API → Service Role

5. **Configure environment variables**

   **Frontend (.env.local in root directory):**

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

   **Backend (backend/.env):**

   ```bash
   PORT=3001
   SUPABASE_URL=your_project_url
   SUPABASE_SERVICE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

6. **Set up database**
   - Open Supabase SQL Editor
   - Run `supabase-schema.sql` to create all tables
   - Run `approval-system-schema.sql` for user approval system

7. **Start backend server**

```bash
cd backend
npm run dev
```

8. **Start frontend server (in new terminal)**

```bash
npm run dev
```

9. **Open your browser**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:3001](http://localhost:3001)
   - **Register an admin account first** (auto-approved)
   - Then register student/caretaker accounts (admin approval required)

**📖 For detailed setup instructions, see [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)**

---

## 📚 Documentation

Comprehensive documentation is available:

### Getting Started

- **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - Quick overview of what's been implemented
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Step-by-step setup verification
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Cheat sheet for common tasks

### In-Depth Guides

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Complete Supabase configuration guide
- **[AUTH_README.md](./AUTH_README.md)** - Authentication system documentation
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Code organization and architecture

### Reference

- **[SQL_COMMANDS_REFERENCE.md](./SQL_COMMANDS_REFERENCE.md)** - Database queries and schema
- **[.env.example](./.env.example)** - Environment variables template

---

## 🏗️ Tech Stack

### Frontend

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library with latest features
- **[TypeScript 5.9](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 4.0](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible UI components
- **[Lucide Icons](https://lucide.dev/)** - Modern icon library
- **[Recharts](https://recharts.org/)** - Composable charting library
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

### Backend API

- **[Express.js 4.21](https://expressjs.com/)** - Fast, minimalist web framework
- **[Node.js](https://nodejs.org/)** - JavaScript runtime
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe backend code
- **[Zod](https://zod.dev/)** - Request validation schemas
- **Centralized API Architecture**:
  - RESTful API endpoints at `http://localhost:3001`
  - JWT-based authentication middleware
  - Role-based access control (RBAC)
  - Automatic error handling and logging
  - Request validation with Zod schemas
  - Audit logging service
  - Notification service

### Database & Auth

- **[Supabase](https://supabase.com/)** - Backend as a Service
  - **PostgreSQL Database** - Powerful relational database
  - **Supabase Auth** - Authentication and user management
  - **Row Level Security (RLS)** - Database-level access control
  - **Supabase Admin Client** - Backend uses service role for full access
  - **Real-time subscriptions** - Live data updates
  - **Storage** - File upload capabilities

### Architecture Pattern

- **Backend-First Design**: All database operations go through Express.js API
- **Centralized API Client** (`lib/api.ts`): Type-safe API functions with automatic JWT injection
- **No Direct Database Calls**: Frontend never calls Supabase directly (except auth)
- **Role-Based Filtering**: Backend controllers handle all permission logic
- **Type Safety**: Shared TypeScript interfaces between frontend and backend

### Development Tools

- **[npm](https://www.npmjs.com/)** - Package manager
- **[ESLint](https://eslint.org/)** - Code linting
- **[tsx](https://github.com/esbuild-kit/tsx)** - TypeScript execution for backend
- **[Nodemon](https://nodemon.io/)** - Backend hot reload
- **[Vercel Analytics](https://vercel.com/analytics)** - Usage analytics

---

## 📁 Project Structure

```
HostelVoice/
├── app/                          # Next.js App Router (Frontend)
│   ├── login/                   # Login page
│   ├── register/                # Registration pages
│   │   ├── student/            # Student registration
│   │   ├── caretaker/          # Caretaker registration
│   │   └── admin/              # Admin registration
│   ├── dashboard/              # Protected dashboard
│   │   ├── page.tsx           # Main dashboard (role-specific)
│   │   ├── analytics/         # Analytics page (admin only)
│   │   ├── announcements/     # View announcements
│   │   ├── announcements-manage/ # Manage announcements (staff)
│   │   ├── issues/            # Issue tracking
│   │   ├── lost-found/        # Lost & Found management
│   │   ├── residents/         # Resident information
│   │   ├── management/        # Hostel management (admin)
│   │   └── user-approvals/    # Approve users (admin)
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
│
├── backend/                      # Express.js Backend API
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   │   ├── announcements.controller.ts
│   │   │   ├── issues.controller.ts
│   │   │   ├── lostfound.controller.ts
│   │   │   ├── residents.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── routes/             # API routes
│   │   │   ├── announcements.routes.ts
│   │   │   ├── issues.routes.ts
│   │   │   ├── lostfound.routes.ts
│   │   │   ├── residents.routes.ts
│   │   │   └── admin.routes.ts
│   │   ├── middleware/         # Custom middleware
│   │   │   ├── auth.middleware.ts    # JWT verification
│   │   │   ├── error.middleware.ts   # Error handling
│   │   │   └── index.ts
│   │   ├── services/           # Business logic
│   │   │   ├── audit.service.ts
│   │   │   └── notification.service.ts
│   │   ├── utils/              # Utilities
│   │   │   ├── validators.ts   # Zod schemas
│   │   │   └── response.ts     # Response helpers
│   │   ├── config/             # Configuration
│   │   │   └── supabase.ts     # Supabase admin client
│   │   └── index.ts            # Express app entry
│   ├── package.json
│   └── .env                    # Backend environment variables
│
├── components/                   # React Components
│   ├── theme-provider.tsx
│   └── ui/                      # Shadcn UI components (40+ components)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── table.tsx
│       └── ... (and more)
│
├── lib/                         # Frontend Utilities
│   ├── api.ts                  # Centralized API client with typed functions
│   ├── auth-context.tsx        # React Context for authentication
│   ├── utils.ts                # Helper functions
│   └── supabase/               # Supabase clients
│       ├── client.ts           # Browser client (auth only)
│       ├── server.ts           # Server component client
│       └── middleware.ts       # Auth middleware
│
├── hooks/                       # Custom React Hooks
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── public/                      # Static Assets
│   └── logo/                   # Application logos
│
├── styles/
│   └── globals.css             # Global CSS styles
│
├── Database Schemas:
├── supabase-schema.sql         # Main database schema
├── approval-system-schema.sql  # User approval system
│
├── Documentation:
├── README.md                    # This file
├── AUTH_README.md              # Authentication documentation
├── SUPABASE_SETUP.md           # Supabase setup guide
├── PROJECT_STRUCTURE.md        # Detailed project structure
│
├── Configuration:
├── next.config.mjs             # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── components.json             # Shadcn UI configuration
├── middleware.ts               # Next.js middleware (auth)
└── package.json                # Frontend dependencies
```

---

## 🗄️ Database Schema

### Core Tables

#### 1. **users** - User Profiles and Authentication

- Stores all user information with role-based fields
- Fields: `id`, `email`, `full_name`, `phone_number`, `role`, `hostel_name`, `room_number`, `student_id`, `approval_status`, `created_at`, `updated_at`
- Roles: `student`, `caretaker`, `admin`
- Approval system: New users require admin approval (except admins)
- Used by residents API for role-based filtering

#### 2. **issues** - Issue/Complaint Tracking

- Complete issue management system
- Fields: `id`, `title`, `description`, `category`, `priority`, `status`, `reported_by`, `assigned_to`, `location`, `created_at`, `updated_at`, `resolved_at`
- Categories: `maintenance`, `cleaning`, `security`, `facilities`, `other`
- Priorities: `low`, `medium`, `high`, `urgent`
- Status flow: `open` → `in_progress` → `resolved` / `closed`

#### 3. **announcements** - System Announcements

- Broadcast important updates to users
- Fields: `id`, `title`, `content`, `target_audience`, `created_by`, `is_pinned`, `created_at`, `updated_at`
- Target audiences: `all`, `students`, `staff`
- Pin important announcements to top
- Full CRUD with role-based permissions

#### 4. **lost_found** - Lost and Found Items

- Comprehensive item tracking with datetime precision
- Fields:
  - Basic: `id`, `item_name`, `description`, `category`, `type`
  - Location: `location_lost`, `location_found`, `current_location`
  - Dates: `date_lost`, `date_found`, `claimed_at` (ISO datetime format)
  - Contact: `contact_info`, `notes`
  - Status: `status` (open, claimed, returned, closed)
  - Relations: `reported_by`, `claimed_by`
  - Timestamps: `created_at`, `updated_at`
- Categories: `wallet`, `electronics`, `bags`, `keys`, `documents`, `clothing`, `other`
- Type: `lost` or `found`
- All students can view all items for better recovery
- Smart matching system notifies users of potential matches

#### 5. **residents** - Extended Student Information

- Additional information for students
- Fields: `id`, `user_id`, `guardian_name`, `guardian_phone`, `guardian_email`, `permanent_address`, `blood_group`
- Linked to users table via foreign key

#### 6. **notifications** - User Notifications

- In-app notification system
- Fields: `id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`
- Types: `issue_assigned`, `announcement`, `lost_found_match`, etc.

#### 7. **audit_logs** - Action Tracking

- Complete audit trail for accountability
- Fields: `id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_data`, `new_data`, `ip_address`, `user_agent`, `created_at`
- Tracks all CRUD operations
- Stores before/after state for data changes

### Database Features

✅ **Row Level Security (RLS)** - Database-level access control policies  
✅ **Proper Indexes** - Optimized queries for performance  
✅ **Foreign Key Relationships** - Data integrity enforcement  
✅ **Automatic Timestamps** - `created_at` and `updated_at` managed by triggers  
✅ **Check Constraints** - Valid enum values enforced at DB level  
✅ **Cascading Deletes** - Proper cleanup of related records

### API Architecture

**Backend-First Approach:**

- Frontend NEVER calls Supabase directly (except for auth)
- All data operations go through Express.js API at `localhost:3001`
- Backend uses Supabase Admin client for full database access
- Role-based filtering implemented in controllers
- Type-safe API client in `lib/api.ts` with automatic JWT injection

**Example: Residents API Flow**

```typescript
// Frontend calls centralized API
const residents = await residentsApi.getAll(page, limit);

// Backend controller handles role-based logic
// - Students: See only their own record
// - Caretakers: See students in their hostel
// - Admins: See all students
```

**See [supabase-schema.sql](./supabase-schema.sql) for complete schema**

---

## 🔐 Security

- ✅ **Row Level Security (RLS)** - Database-level access control
- ✅ **Password hashing** - Secure password storage via Supabase
- ✅ **Role-based access** - Users can only access permitted resources
- ✅ **Protected routes** - Middleware guards all dashboard pages
- ✅ **Session management** - Automatic token refresh
- ✅ **Environment variables** - Sensitive data never committed

---

## 🧪 Testing

### Create Test Users

```bash
# Start dev server
pnpm dev

# Register test users at http://localhost:3000/register
# IMPORTANT: Register admin first, then approve other accounts

# Admin (auto-approved):
Admin: admin@hostelvoice.com / password123

# Student/Caretaker (need admin approval):
Student: student@hostelvoice.com / password123
Caretaker: caretaker@hostelvoice.com / password123
```

### Verify Setup

Follow the checklist in [`SETUP_CHECKLIST.md`](./SETUP_CHECKLIST.md)

---

## 📦 Build & Deploy

### Build for Production

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

---

## 🛠️ Development

### Available Scripts

**Frontend:**

```bash
npm run dev       # Start Next.js development server (localhost:3000)
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

**Backend:**

```bash
cd backend
npm run dev       # Start Express.js with hot reload (localhost:3001)
npm run build     # Compile TypeScript to JavaScript
npm start         # Start production server
```

### Development Workflow

1. **Start Backend First:**

   ```bash
   cd backend
   npm run dev
   ```

   Backend runs on `http://localhost:3001`

2. **Start Frontend (new terminal):**

   ```bash
   npm run dev
   ```

   Frontend runs on `http://localhost:3000`

3. **Both servers must be running for the app to work**

### API Development

**Adding a New API Endpoint:**

1. Create controller in `backend/src/controllers/`
2. Add route in `backend/src/routes/`
3. Add validation schema in `backend/src/utils/validators.ts`
4. Add API function in `lib/api.ts` (frontend)
5. Add TypeScript interface in `lib/api.ts`

**Example:**

```typescript
// backend/src/controllers/example.controller.ts
export class ExampleController {
  static async getData(req: Request, res: Response) {
    const user = req.user!; // From auth middleware
    const data = validate(exampleSchema, req.body);
    // ... implement logic
    sendSuccess(res, "Success", result);
  }
}

// lib/api.ts (frontend)
export const exampleApi = {
  getData: (params: ExampleParams) =>
    apiGet<ExampleResponse>("/api/example", params),
};
```

### Database Development

```bash
# Access Supabase Dashboard at app.supabase.com
# SQL Editor: Run custom queries and migrations
# Table Editor: View/edit data directly
# Authentication: Manage users and sessions
# Database: Monitor performance and connections
```

### Debugging

**Backend Logs:**

- All API requests logged to console
- Error stack traces shown in development
- Audit logs written to database

**Frontend Logs:**

- Network requests visible in browser DevTools
- React components use `console.log` for debugging
- Toast notifications for user feedback

---

## 🎨 Customization

### Add New User Role

1. Update `UserRole` type in `lib/auth-context.tsx`
2. Update database check constraint in `supabase-schema.sql`
3. Add RLS policies for the new role
4. Update UI to show role option

### Modify User Fields

1. Update `User` interface in `lib/auth-context.tsx`
2. Update database `users` table schema
3. Update registration forms

### Change Theme

Edit `app/globals.css` for global styles or modify Tailwind config.

---

## 🐛 Troubleshooting

### Common Issues

**"Cannot connect to API" / "Network Error"**

- Ensure backend server is running: `cd backend && npm run dev`
- Check backend is on port 3001: `http://localhost:3001`
- Verify `NEXT_PUBLIC_API_URL=http://localhost:3001` in `.env.local`
- Check backend terminal for error messages

**"Invalid API credentials" / "Unauthorized"**

- Frontend: Check `.env.local` has correct Supabase ANON key
- Backend: Check `backend/.env` has correct SUPABASE_SERVICE_KEY
- Verify JWT_SECRET matches between frontend and backend
- Clear browser localStorage and login again
- Restart both servers after changing env variables

**"Table does not exist"**

- Run `supabase-schema.sql` in Supabase SQL Editor
- Run `approval-system-schema.sql` for user approvals
- Check Supabase dashboard → Database → Tables

**"Permission denied" / "403 Forbidden"**

- Check Row Level Security policies in Supabase
- Verify user role matches expected permissions
- Backend uses service role key (bypasses RLS)
- Frontend should never call Supabase directly for data

**"Failed to fetch residents" / Data not loading**

- Ensure you're calling the API through `lib/api.ts`
- Never use `supabase.from()` directly in frontend
- Check backend controller implements role-based filtering
- Verify backend route has correct middleware (`authMiddleware`)

**Backend build errors**

- Run `npm install` in backend directory
- Check TypeScript version compatibility
- Verify all imports are correct

**Date/Time validation errors (Lost & Found)**

- Backend expects ISO datetime: `"2026-01-21T00:00:00.000Z"`
- Frontend must use `.toISOString()` when sending dates
- Never send plain date strings like `"2026-01-21"`

**Port already in use**

- Frontend (3000): `npx kill-port 3000`
- Backend (3001): `npx kill-port 3001`
- Or change PORT in `backend/.env`

**More help:** See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) and [AUTH_README.md](./AUTH_README.md)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
- [Shadcn/ui](https://ui.shadcn.com/) - Beautiful UI Components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS Framework
- [Vercel](https://vercel.com/) - Deployment Platform

---

## 📞 Support

- **Documentation**: Check the `*.md` files in the project root
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Supabase Help**: [Discord](https://discord.supabase.com)
- **Next.js Help**: [Documentation](https://nextjs.org/docs)

---

## 🗺️ Roadmap

### Current Version (v1.0) ✅

- ✅ Full-stack architecture with Express.js backend
- ✅ User authentication with role-based access control
- ✅ Centralized API pattern (backend-only database access)
- ✅ Complete issue tracking system with view details modal
- ✅ Announcements with targeting and pinning
- ✅ Comprehensive Lost & Found with datetime tracking
  - ✅ Smart location handling (lost/found/current)
  - ✅ Date precision (ISO datetime format)
  - ✅ Contact information and notes
  - ✅ All students can view all items
- ✅ Role-based resident management
  - ✅ Students: Self-view only
  - ✅ Caretakers: Hostel-specific view
  - ✅ Admins: All students
- ✅ Analytics dashboard with role-specific metrics
- ✅ User approval system for new registrations
- ✅ Audit logging for all critical actions
- ✅ Type-safe API with TypeScript across stack

### Upcoming Features

- [ ] **File Upload System**
  - [ ] Image upload for lost & found items
  - [ ] Attachment support for issues
  - [ ] Integration with Supabase Storage
- [ ] **Real-time Features**
  - [ ] Live notifications using WebSockets
  - [ ] Real-time issue status updates
  - [ ] Live announcement broadcasting
- [ ] **Email Notifications**
  - [ ] Welcome emails for new users
  - [ ] Issue assignment notifications
  - [ ] Lost item match alerts
  - [ ] Announcement digests
- [ ] **Enhanced Analytics**
  - [ ] Issue resolution time tracking
  - [ ] User activity heatmaps
  - [ ] Export reports to PDF/Excel
  - [ ] Trend analysis and predictions
- [ ] **Advanced Features**
  - [ ] Mobile app (React Native)
  - [ ] Payment integration for hostel rent
  - [ ] Visitor management system
  - [ ] Room allocation and transfer system
  - [ ] Complaint escalation workflow
  - [ ] Multi-language support
- [ ] **Performance Optimization**
  - [ ] Redis caching layer
  - [ ] Database query optimization
  - [ ] CDN for static assets
  - [ ] Progressive Web App (PWA) features

---

## 📊 Screenshots

### Landing Page

Modern, responsive landing page with role selection.

### Dashboard

Role-specific dashboards with relevant features and analytics.

### Issue Management

Report, track, and resolve hostel issues efficiently.

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

<div align="center">

**Built with ❤️ for better hostel management**

[Documentation](./SUPABASE_SETUP.md) • [Quick Start](./QUICK_REFERENCE.md) • [Report Bug](https://github.com/your-repo/issues) • [Request Feature](https://github.com/your-repo/issues)

</div>
