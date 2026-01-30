<div align="center">
  <img src="./public/logo/logo.png" alt="HostelVoice Logo" width="200" />
  
  # 🏠 HostelVoice - Smart Hostel Management System

  <p>A comprehensive full-stack hostel management solution with <strong>Next.js 16</strong> frontend, <strong>Express.js</strong> backend API, and <strong>Supabase</strong> database. Features secure role-based authentication, real-time issue tracking, announcements, lost & found management, leave management, mess management, and analytics dashboard.</p>

  [![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-4.21-green)](https://expressjs.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)
</div>

---

## ✨ Features

### 🔐 Authentication & Security

- **Simple Sign Up & Login** - Create your account and log in securely
- **Three User Types** - Student, Caretaker, and Admin roles with different access
- **Admin Approval System** - New students and caretakers need admin approval before accessing the system
- **Protected Pages** - Only logged-in users can access the dashboard
- **Automatic Login Refresh** - Stay logged in without re-entering password

---

## � How HostelVoice Works - Complete Flow

### System Architecture Overview

HostelVoice follows a **backend-first architecture** where all database operations are centralized through the Express.js API server. This ensures consistent business logic, proper authorization, and audit logging.

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Next.js 16     │────────▶│  Express.js     │────────▶│   Supabase      │
│  Frontend       │  HTTP   │  Backend API    │  Admin  │   PostgreSQL    │
│  (Port 3000)    │  REST   │  (Port 3001)    │  Client │   Database      │
│                 │◀────────│                 │◀────────│                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
      │                            │                            │
      │ Auth Only                  │ All Data Ops               │
      │                            │ + Audit Logs               │
      │                            │ + Notifications            │
      └───────────────────────────▶│                            │
          Supabase Auth            │                            │
          (Login/Register)         │                            │
                                   └────────────────────────────┘
```

### 🚦 User Journey Flow

#### 1️⃣ **Registration & Approval Flow**

```
New User
   │
   ├─ Visits /register
   │
   ├─ Selects Role: Student / Caretaker / Admin
   │
   ├─ Fills Registration Form
   │   ├─ Student: Name, Email, Phone, Hostel, Room, Student ID
   │   ├─ Caretaker: Name, Email, Phone, Hostels Assigned
   │   └─ Admin: Name, Email, Phone, Department
   │
   ├─ Supabase Auth creates account
   │   └─ Password encrypted & stored securely
   │
   ├─ User record created in database
   │   └─ approval_status = 'pending' (except Admin = 'approved')
   │
   ├─ Admin receives approval request
   │   ├─ Reviews user details
   │   ├─ Approves ✅ or Rejects ❌
   │   └─ Audit log created
   │
   └─ User logs in
       ├─ If approved → Access dashboard
       └─ If pending/rejected → Show waiting message
```

#### 2️⃣ **Authentication & Authorization Flow**

```
User Login
   │
   ├─ Enters email & password at /login
   │
   ├─ Supabase Auth validates credentials
   │   ├─ Success → Returns JWT access token
   │   └─ Failure → Show error message
   │
   ├─ Frontend stores token in localStorage
   │   └─ AuthContext provides user state globally
   │
   ├─ Middleware checks all /dashboard/* routes
   │   ├─ No token → Redirect to /login
   │   ├─ Token expired → Refresh token automatically
   │   └─ Valid token → Allow access
   │
   ├─ Every API call includes JWT in Authorization header
   │   └─ Backend authMiddleware verifies token
   │       ├─ Decodes user info (id, email, role)
   │       ├─ Attaches req.user to request
   │       └─ Rejects if invalid/expired
   │
   └─ Role-based access control
       ├─ Frontend: Conditionally renders UI
       ├─ Backend: Filters data by role
       └─ Database: RLS policies as backup
```

#### 3️⃣ **Issue Management Flow**

```
Student Reports Issue
   │
   ├─ Navigates to /dashboard/issues
   │
   ├─ Clicks "Report New Issue"
   │
   ├─ Fills Form
   │   ├─ Title: "AC not working in Room 301"
   │   ├─ Description: Detailed explanation
   │   ├─ Category: Maintenance
   │   ├─ Priority: High
   │   └─ Location: Block B, Room 301
   │
   ├─ Frontend calls POST /api/issues
   │   └─ JWT token included automatically
   │
   ├─ Backend Controller
   │   ├─ Validates request with Zod schema
   │   ├─ Creates issue in database
   │   ├─ Sets status = 'open'
   │   ├─ Sets reported_by = user.id
   │   ├─ Logs to audit_logs table
   │   └─ Notifies caretaker
   │
   ├─ Caretaker sees issue
   │   ├─ Views in /dashboard/issues
   │   ├─ Filtered by their hostel automatically
   │   ├─ Assigns to staff member
   │   └─ Updates status to 'in_progress'
   │
   ├─ Staff member works on issue
   │   └─ Updates progress via backend API
   │
   ├─ Issue resolved
   │   ├─ Caretaker marks as 'resolved'
   │   ├─ Student receives notification
   │   ├─ resolved_at timestamp set
   │   └─ Audit log created
   │
   └─ Student views history
       └─ All status changes tracked with timestamps
```

#### 4️⃣ **Leave Application Flow**

**Student Leave:**
```
Student → Apply Leave
   │
   ├─ Fills leave form (/dashboard/student-leave)
   │   ├─ Start Date & End Date
   │   ├─ Destination Address
   │   ├─ Reason for leave
   │   └─ Contact during leave
   │
   ├─ Submits to backend API
   │   └─ POST /api/leave/student
   │
   ├─ Caretaker reviews (/dashboard/caretaker-leave)
   │   ├─ Sees all pending requests for their hostel
   │   ├─ Can approve, reject, or request more info
   │   └─ Adds comments/feedback
   │
   ├─ Student gets notification
   │   └─ Checks status at /dashboard/leave-status
   │
   └─ Status updated
       ├─ Approved → Student can leave
       ├─ Rejected → Show reason
       └─ Info Needed → Student provides additional details
```

**Caretaker Leave:**
```
Caretaker → Apply Leave
   │
   ├─ Fills leave form (/dashboard/caretaker-leave)
   │   ├─ Leave dates
   │   ├─ Reason (casual/sick/emergency)
   │   ├─ Suggests replacement caretaker
   │   └─ Uploads documents (if sick leave)
   │
   ├─ Admin reviews (/dashboard/admin-leave-management)
   │   ├─ Checks leave calendar for conflicts
   │   ├─ Assigns replacement caretaker
   │   ├─ Approves or conditionally approves
   │   └─ Ensures no hostel left unattended
   │
   ├─ Caretaker gets notification
   │   └─ Checks at /dashboard/caretaker-leave-status
   │
   └─ System tracks
       ├─ Who is on leave when
       ├─ Replacement assignments
       └─ Leave balance remaining
```

#### 5️⃣ **Mess Management Flow**

```
Caretaker → Upload Menu
   │
   ├─ Navigates to /dashboard/mess-management
   │
   ├─ Uploads menu card image (PNG/JPG)
   │   └─ Stored in Supabase Storage
   │
   ├─ Fills weekly menu calendar
   │   ├─ Monday: Breakfast, Lunch, Snacks, Dinner
   │   ├─ Tuesday: ... (all 7 days)
   │   └─ Items: "Idli, Sambar, Chutney, Tea"
   │
   ├─ System validates all fields filled
   │
   ├─ Menu saved to database
   │   └─ POST /api/mess/upload-menu
   │
   └─ Students can view
       └─ At /dashboard/mess

Student → Give Feedback
   │
   ├─ Views current menu
   │
   ├─ After eating, submits feedback
   │   ├─ Rating (1-5 stars)
   │   ├─ Comments/suggestions
   │   └─ Meal type (breakfast/lunch/dinner)
   │
   ├─ Feedback stored in database
   │   └─ POST /api/mess/feedback
   │
   ├─ Caretaker sees all feedback
   │   └─ At /dashboard/mess-management
   │
   ├─ Caretaker responds
   │   └─ Marks as reviewed with response
   │
   └─ Admin monitors
       └─ Mess analytics across all hostels
```

#### 6️⃣ **Lost & Found Flow**

```
Student Loses Item
   │
   ├─ Reports at /dashboard/lost-found
   │
   ├─ Fills form
   │   ├─ Item: "Blue JBL Headphones"
   │   ├─ Category: Electronics
   │   ├─ Date & time lost: ISO format
   │   ├─ Location: "Near basketball court"
   │   ├─ Contact: Phone number
   │   └─ Additional notes
   │
   ├─ System checks for matches
   │   └─ Smart matching algorithm
   │       ├─ Same category
   │       ├─ Similar description
   │       ├─ Nearby location
   │       └─ Recent timeframe
   │
   ├─ Notifies if match found
   │
   └─ All students can see
       └─ Public visibility for better recovery

Someone Finds Item
   │
   ├─ Reports as "Found"
   │
   ├─ Fills form
   │   ├─ Item found: "Blue headphones"
   │   ├─ Date & location found
   │   ├─ Current location: "Security office"
   │   └─ Contact info
   │
   ├─ System notifies potential owners
   │   └─ Matches with lost reports
   │
   ├─ Owner contacts finder
   │   └─ Verifies ownership
   │
   ├─ Item marked as "claimed"
   │   └─ PUT /api/lost-found/:id/claim
   │
   └─ Success! Item returned to owner
```

#### 7️⃣ **Announcement Flow**

```
Caretaker/Admin → Post Announcement
   │
   ├─ Creates announcement (/dashboard/announcements-manage)
   │
   ├─ Fills form
   │   ├─ Title: "Water supply maintenance"
   │   ├─ Content: Full details
   │   ├─ Target: Students / Staff / All
   │   └─ Pin important: Yes/No
   │
   ├─ Backend validates & stores
   │   └─ POST /api/announcements
   │
   ├─ Users see announcement
   │   ├─ Pinned items show first
   │   ├─ Filtered by target_audience
   │   └─ Displayed on dashboard
   │
   └─ Notification sent
       └─ All target users notified
```

#### 8️⃣ **Analytics & Reporting Flow**

```
Admin → View Analytics
   │
   ├─ Navigates to /dashboard/analytics
   │
   ├─ Backend aggregates data
   │   └─ GET /api/analytics/admin
   │       ├─ Counts: Total users, issues, announcements
   │       ├─ Status breakdown: Open vs resolved
   │       ├─ Trends: Issues over time
   │       └─ Hostel-wise statistics
   │
   ├─ Frontend renders charts
   │   ├─ Recharts library
   │   ├─ Bar charts, line graphs
   │   └─ Pie charts for distribution
   │
   └─ Real-time updates
       └─ Data refreshes automatically
```

### 🔐 Security Flow

```
Every Request
   │
   ├─ Frontend sends request with JWT token
   │   └─ Authorization: Bearer <token>
   │
   ├─ Backend authMiddleware
   │   ├─ Extracts token from header
   │   ├─ Verifies with Supabase
   │   ├─ Decodes user info
   │   └─ Attaches to req.user
   │
   ├─ Role-based filtering in controllers
   │   ├─ Student: Own data only
   │   ├─ Caretaker: Their hostel only
   │   └─ Admin: All data
   │
   ├─ Database queries filtered by role
   │   └─ No cross-hostel data leakage
   │
   ├─ Audit log created
   │   ├─ Who did what
   │   ├─ When and from where (IP)
   │   ├─ Before/after state
   │   └─ Stored in audit_logs table
   │
   └─ Response sent
       └─ Only authorized data returned
```

### 📊 Data Flow Pattern

**Example: Getting Issues**

```typescript
1. User clicks "View Issues" button
   ↓
2. Frontend (React Component)
   const { data } = await issuesApi.getAll(filters)
   ↓
3. API Client (lib/api.ts)
   - Adds JWT token to headers
   - Makes request: GET /api/issues?status=open
   ↓
4. Express Backend (controllers/issues.controller.ts)
   - authMiddleware verifies token
   - Extract user info from req.user
   - Check user role
   ↓
5. Role-Based Filtering
   if (role === 'student') {
     // Only issues reported by this student
     query = query.eq('reported_by', userId)
   } else if (role === 'caretaker') {
     // Issues from their assigned hostels
     query = query.in('hostel_name', userHostels)
   } else if (role === 'admin') {
     // All issues, no filter
   }
   ↓
6. Supabase Query (with Admin Client)
   - Backend uses service role key
   - Bypasses RLS policies
   - Applies programmatic filters
   ↓
7. Response
   - Returns filtered data
   - Frontend renders in table
   - User sees only their authorized data
```

### 🔄 State Management Flow

```
Application State
   │
   ├─ Authentication State (AuthContext)
   │   ├─ User object (id, email, role, hostel)
   │   ├─ JWT token
   │   ├─ Loading states
   │   └─ Login/logout functions
   │
   ├─ Component Local State (useState)
   │   ├─ Form inputs
   │   ├─ Loading indicators
   │   └─ Error messages
   │
   ├─ Server State (API calls)
   │   ├─ Fetched on component mount
   │   ├─ Cached in component state
   │   └─ Refreshed on mutations
   │
   └─ Notifications (Toast)
       ├─ Success messages
       ├─ Error alerts
       └─ Info notifications
```

---

## �👥 What Each User Can Do

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

## 🛠️ Development Guide

### Quick Start Commands

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
npm run typecheck # Type-check without emitting files
npm run lint      # Run ESLint on backend code
```

### Complete Development Setup

#### 1. Initial Setup

```bash
# Clone repository
git clone <your-repo-url>
cd HostelVoice

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Setup environment variables
cp .env.example .env.local
cd backend
cp .env.example .env
cd ..
```

#### 2. Configure Environment Files

**Frontend (`.env.local`):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Backend (`backend/.env`):**
```bash
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
```

#### 3. Setup Database

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Open SQL Editor
3. Run `supabase-schema.sql` (main schema)
4. Run `approval-system-schema.sql` (user approvals)
5. Run `leave-system-schema.sql` (leave management)
6. Run `mess-system-schema.sql` (mess management)

#### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend running at `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
✅ Frontend running at `http://localhost:3000`

**Both must be running!** Frontend calls backend API for all data operations.

### Development Workflow

#### Daily Development Routine

```bash
# Morning - Start servers
Terminal 1: cd backend && npm run dev
Terminal 2: npm run dev

# During development
- Make changes to files
- Both servers auto-reload
- Test changes in browser
- Check terminal for errors

# Afternoon - Check logs
Terminal 1: Backend API logs
Terminal 2: Next.js build logs
Browser: DevTools Console & Network tab

# End of day - Commit changes
git add .
git commit -m "feat: add new feature"
git push
```

#### Hot Reload Behavior

**Frontend (Next.js):**
- ✅ React components - instant refresh
- ✅ CSS/Tailwind - instant update
- ✅ TypeScript - recompiles automatically
- ❌ `.env.local` changes - requires restart

**Backend (Express.js with tsx watch):**
- ✅ Controllers - auto-restart
- ✅ Routes - auto-restart  
- ✅ Services - auto-restart
- ❌ `backend/.env` changes - requires restart

### Adding New Features - Complete Guide

#### Example: Adding a "Feedback" Feature

**Step 1: Plan the Feature**
```
Feature: Student Feedback System
- Students can submit feedback about hostel
- Caretakers can view and respond
- Categories: cleanliness, food, facilities, staff
- Ratings: 1-5 stars
```

**Step 2: Create Database Table**
```sql
-- backend/feedback-schema.sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hostel_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cleanliness', 'food', 'facilities', 'staff')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  response TEXT,
  responded_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_student ON feedback(student_id);
CREATE INDEX idx_feedback_hostel ON feedback(hostel_name);
CREATE INDEX idx_feedback_status ON feedback(status);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = student_id OR 
         EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('caretaker', 'admin')));
```

**Step 3: Create TypeScript Interfaces**
```typescript
// backend/src/types/index.ts
export interface Feedback {
  id: string;
  student_id: string;
  hostel_name: string;
  category: 'cleanliness' | 'food' | 'facilities' | 'staff';
  rating: number;
  comment: string;
  response?: string;
  responded_by?: string;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackDto {
  category: string;
  rating: number;
  comment: string;
}

export interface RespondFeedbackDto {
  response: string;
}
```

**Step 4: Create Validation Schemas**
```typescript
// backend/src/utils/validators.ts
import { z } from 'zod';

export const createFeedbackSchema = z.object({
  category: z.enum(['cleanliness', 'food', 'facilities', 'staff']),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000)
});

export const respondFeedbackSchema = z.object({
  response: z.string().min(5).max(500)
});
```

**Step 5: Create Backend Controller**
```typescript
// backend/src/controllers/feedback.controller.ts
import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabaseClient';
import { sendSuccess, sendError } from '../utils/response';
import { createFeedbackSchema, respondFeedbackSchema } from '../utils/validators';
import { auditService } from '../services/audit.service';

export class FeedbackController {
  // Get all feedback (role-based filtering)
  static async getAll(req: Request, res: Response) {
    try {
      const user = req.user!;
      const { status, category } = req.query;
      
      let query = supabaseAdmin
        .from('feedback')
        .select('*, users!feedback_student_id_fkey(full_name, email)');
      
      // Role-based filtering
      if (user.role === 'student') {
        query = query.eq('student_id', user.id);
      } else if (user.role === 'caretaker') {
        // Caretaker sees feedback from their hostels
        const assignedHostels = user.assigned_hostels || [];
        query = query.in('hostel_name', assignedHostels);
      }
      // Admin sees all
      
      // Apply filters
      if (status) query = query.eq('status', status);
      if (category) query = query.eq('category', category);
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      sendSuccess(res, 'Feedback fetched successfully', data);
    } catch (error: any) {
      console.error('Error fetching feedback:', error);
      sendError(res, error.message || 'Failed to fetch feedback', 500);
    }
  }

  // Create feedback (students only)
  static async create(req: Request, res: Response) {
    try {
      const user = req.user!;
      
      // Validate request body
      const validated = createFeedbackSchema.parse(req.body);
      
      const { data, error } = await supabaseAdmin
        .from('feedback')
        .insert({
          student_id: user.id,
          hostel_name: user.hostel_name,
          category: validated.category,
          rating: validated.rating,
          comment: validated.comment,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log to audit
      await auditService.log({
        user_id: user.id,
        action: 'CREATE_FEEDBACK',
        entity_type: 'feedback',
        entity_id: data.id,
        new_data: data
      });
      
      sendSuccess(res, 'Feedback submitted successfully', data, 201);
    } catch (error: any) {
      console.error('Error creating feedback:', error);
      sendError(res, error.message || 'Failed to create feedback', 400);
    }
  }

  // Respond to feedback (caretaker/admin)
  static async respond(req: Request, res: Response) {
    try {
      const user = req.user!;
      const { id } = req.params;
      
      // Check if user is caretaker or admin
      if (!['caretaker', 'admin'].includes(user.role)) {
        return sendError(res, 'Only caretakers and admins can respond', 403);
      }
      
      const validated = respondFeedbackSchema.parse(req.body);
      
      // Get original feedback
      const { data: original } = await supabaseAdmin
        .from('feedback')
        .select('*')
        .eq('id', id)
        .single();
      
      const { data, error } = await supabaseAdmin
        .from('feedback')
        .update({
          response: validated.response,
          responded_by: user.id,
          status: 'responded',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log to audit
      await auditService.log({
        user_id: user.id,
        action: 'RESPOND_FEEDBACK',
        entity_type: 'feedback',
        entity_id: id,
        old_data: original,
        new_data: data
      });
      
      sendSuccess(res, 'Response added successfully', data);
    } catch (error: any) {
      console.error('Error responding to feedback:', error);
      sendError(res, error.message || 'Failed to respond', 400);
    }
  }
}
```

**Step 6: Create Backend Routes**
```typescript
// backend/src/routes/feedback.routes.ts
import { Router } from 'express';
import { FeedbackController } from '../controllers/feedback.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.get('/', authMiddleware, FeedbackController.getAll);
router.post('/', authMiddleware, FeedbackController.create);
router.put('/:id/respond', authMiddleware, FeedbackController.respond);

export default router;
```

**Step 7: Register Routes in App**
```typescript
// backend/src/app.ts
import feedbackRoutes from './routes/feedback.routes';

// ... other imports

app.use('/api/feedback', feedbackRoutes);
```

**Step 8: Create Frontend API Client**
```typescript
// lib/api.ts

// Add interface
export interface Feedback {
  id: string;
  student_id: string;
  hostel_name: string;
  category: 'cleanliness' | 'food' | 'facilities' | 'staff';
  rating: number;
  comment: string;
  response?: string;
  responded_by?: string;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
  updated_at: string;
  users?: {
    full_name: string;
    email: string;
  };
}

// Add API functions
export const feedbackApi = {
  getAll: (filters?: { status?: string; category?: string }) =>
    apiGet<Feedback[]>('/api/feedback', filters),
    
  create: (data: { category: string; rating: number; comment: string }) =>
    apiPost<Feedback>('/api/feedback', data),
    
  respond: (id: string, response: string) =>
    apiPut<Feedback>(`/api/feedback/${id}/respond`, { response })
};
```

**Step 9: Create React Component**
```typescript
// app/dashboard/feedback/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { feedbackApi, Feedback } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Star } from 'lucide-react';

export default function FeedbackPage() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [category, setCategory] = useState('cleanliness');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const data = await feedbackApi.getAll();
      setFeedback(data);
    } catch (error) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error('Please enter your feedback');
      return;
    }
    
    try {
      await feedbackApi.create({ category, rating, comment });
      toast.success('Feedback submitted successfully!');
      setComment('');
      setShowForm(false);
      loadFeedback();
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  const handleRespond = async (id: string, response: string) => {
    try {
      await feedbackApi.respond(id, response);
      toast.success('Response added successfully!');
      loadFeedback();
    } catch (error) {
      toast.error('Failed to add response');
    }
  };

  if (loading) {
    return <div className="p-8">Loading feedback...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Feedback</h1>
        {user?.role === 'student' && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Submit Feedback'}
          </Button>
        )}
      </div>

      {/* Feedback Form (Students only) */}
      {showForm && user?.role === 'student' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Submit Your Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleanliness">Cleanliness</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="facilities">Facilities</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-8 h-8 cursor-pointer ${
                        star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-2">Your Feedback</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={5}
                />
              </div>

              <Button type="submit">Submit Feedback</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Feedback List */}
      <div className="space-y-4">
        {feedback.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No feedback submitted yet
            </CardContent>
          </Card>
        ) : (
          feedback.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="capitalize">{item.category}</CardTitle>
                    {user?.role !== 'student' && item.users && (
                      <p className="text-sm text-gray-500">
                        By: {item.users.full_name}
                      </p>
                    )}
                  </div>
                  <div className="flex">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{item.comment}</p>
                
                {item.response && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Response:</p>
                    <p>{item.response}</p>
                  </div>
                )}

                {/* Response form for caretakers */}
                {!item.response && ['caretaker', 'admin'].includes(user?.role || '') && (
                  <div className="mt-4">
                    <Textarea
                      placeholder="Type your response..."
                      id={`response-${item.id}`}
                    />
                    <Button
                      className="mt-2"
                      onClick={() => {
                        const textarea = document.getElementById(`response-${item.id}`) as HTMLTextAreaElement;
                        handleRespond(item.id, textarea.value);
                      }}
                    >
                      Send Response
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
```

**Step 10: Add Navigation Link**
```typescript
// app/dashboard/layout.tsx or wherever your navigation is
<Link href="/dashboard/feedback">
  <MessageSquare className="mr-2 h-4 w-4" />
  Feedback
</Link>
```

**Step 11: Test the Feature**

```bash
# 1. Run SQL schema in Supabase SQL Editor

# 2. Restart backend server (Ctrl+C then npm run dev)

# 3. Test in browser:
#    - Login as student
#    - Go to /dashboard/feedback
#    - Submit feedback
#    - Login as caretaker
#    - View and respond to feedback

# 4. Check backend logs for any errors

# 5. Verify in Supabase dashboard:
#    - Database → feedback table
#    - Check data is being saved correctly
```

### Debugging Guide

#### Backend Debugging

**Enable Detailed Logging:**
```typescript
// backend/src/controllers/yourController.ts
console.log('🔍 Request:', {
  user: req.user,
  params: req.params,
  query: req.query,
  body: req.body
});

const { data, error } = await query;
console.log('✅ Success:', data);
console.log('❌ Error:', error);
```

**Check Backend Logs:**
```bash
# Terminal 1 shows:
POST /api/feedback 201 123.456 ms  # Success
POST /api/feedback 400 45.123 ms   # Validation error
POST /api/feedback 500 89.012 ms   # Server error
```

**Test API with curl:**
```bash
# Login to get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"password123"}' \
  | jq -r '.token')

# Test endpoint
curl -X GET http://localhost:3001/api/feedback \
  -H "Authorization: Bearer $TOKEN"
```

#### Frontend Debugging

**Browser DevTools:**
```javascript
// 1. Open DevTools (F12)
// 2. Go to Network tab
// 3. Filter by "Fetch/XHR"
// 4. Click request to see:
Request URL: http://localhost:3001/api/feedback
Request Headers: Authorization: Bearer <token>
Request Payload: { category: "food", rating: 5, ... }
Response Status: 200 OK
Response Body: [{ id: "...", ... }]
```

**Console Logging:**
```typescript
// Add to component
useEffect(() => {
  console.log('Component mounted');
  console.log('User:', user);
  loadFeedback();
}, []);

const loadFeedback = async () => {
  console.log('🔄 Loading feedback...');
  try {
    const data = await feedbackApi.getAll();
    console.log('✅ Loaded:', data);
    setFeedback(data);
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
```

#### Common Issues & Solutions

**Issue: 401 Unauthorized**
```bash
Problem: Backend returns "Invalid or expired token"
Solution:
1. Check localStorage has jwt_token
2. Clear localStorage and login again
3. Verify JWT_SECRET matches in both .env files
4. Restart both servers after env changes
```

**Issue: 403 Forbidden / Permission Denied**
```bash
Problem: "Access denied" or empty data
Solution:
1. Check user role: console.log(req.user.role)
2. Verify role-based filtering logic in controller
3. Check RLS policies in Supabase
4. Backend should use service role key (bypasses RLS)
```

**Issue: Data not showing**
```bash
Problem: API returns empty array []
Solution:
1. Check database has data: SELECT * FROM feedback;
2. Verify role-based filtering isn't too restrictive
3. Check user.hostel_name matches data
4. Add console.log in backend controller
```

**Issue: Type errors**
```bash
Problem: TypeScript compilation errors
Solution:
1. Ensure interfaces match between frontend/backend
2. Run: npm run typecheck
3. Check import statements
4. Verify @types packages are installed
```

### Database Development

**Accessing Supabase:**
```bash
# 1. Go to https://supabase.com/dashboard
# 2. Select your project
# 3. Navigate to different sections:
```

**SQL Editor - Run Queries:**
```sql
-- View all feedback
SELECT * FROM feedback ORDER BY created_at DESC LIMIT 10;

-- Get statistics
SELECT 
  category,
  AVG(rating) as avg_rating,
  COUNT(*) as total_count
FROM feedback
GROUP BY category;

-- Find unanswered feedback
SELECT * FROM feedback
WHERE response IS NULL
AND status = 'pending';
```

**Table Editor - View/Edit Data:**
- Click on table name
- See all rows in spreadsheet format
- Edit cells directly (be careful!)
- Add/delete rows manually

**Database - Monitor Performance:**
```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries (if enabled)
SELECT * FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

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

## � Project Status & Summary

### ✅ What's Working Now (January 2026)

**Architecture:**
- ✅ Full-stack application with separate frontend and backend
- ✅ Next.js 16 frontend with App Router
- ✅ Express.js backend API with TypeScript
- ✅ Supabase PostgreSQL database with RLS
- ✅ JWT-based authentication with auto-refresh
- ✅ Role-based access control (Student, Caretaker, Admin)

**Core Features Implemented:**
- ✅ User authentication (register, login, logout)
- ✅ User approval system (admin approval required)
- ✅ Issue/complaint tracking with assignment
- ✅ Announcements with targeting and pinning
- ✅ Lost & Found item management
- ✅ Leave application system (student & caretaker)
- ✅ Mess management (menu upload & feedback)
- ✅ Role-specific dashboards
- ✅ Analytics and reporting
- ✅ Resident information management
- ✅ Audit logging for all critical actions
- ✅ Notification system

**Technical Implementation:**
- ✅ Backend-first architecture (all DB ops through API)
- ✅ Type-safe API client with automatic JWT injection
- ✅ Centralized error handling
- ✅ Request validation with Zod schemas
- ✅ Hot reload in development
- ✅ Production-ready build scripts
- ✅ Comprehensive documentation

### 🎯 How Data Flows

```
User Action → React Component → API Client (lib/api.ts)
    ↓
JWT Token Auto-Attached → HTTP Request → Express Backend
    ↓
Auth Middleware Verifies → Controller Handles Logic
    ↓
Role-Based Filtering Applied → Supabase Query (Admin Client)
    ↓
Data Returned → Audit Log Created → Response Sent
    ↓
Frontend Receives Data → Component Updates → UI Renders
```

### 🔐 Security Implementation

- **Frontend:** Supabase auth for login/register only
- **Backend:** Service role key for all database operations
- **Authorization:** Controllers implement role-based filtering
- **Audit:** All actions logged with user, timestamp, IP
- **Validation:** Zod schemas validate all requests
- **Protection:** Middleware guards all protected routes

### 📊 Current Statistics

**Code Metrics:**
- Frontend Pages: 20+ dashboard pages
- Backend API Endpoints: 50+ routes
- UI Components: 60+ Shadcn components
- Database Tables: 12+ tables with relationships
- Lines of Code: ~15,000+ lines

**Features by Role:**

**Students Can:**
1. ✅ Report and track issues
2. ✅ View announcements
3. ✅ Use lost & found system
4. ✅ Apply for leave
5. ✅ Check leave status
6. ✅ View mess menu
7. ✅ Submit mess feedback
8. ✅ View personal dashboard

**Caretakers Can:**
1. ✅ Manage student issues
2. ✅ Post announcements
3. ✅ Manage lost & found
4. ✅ Review student leaves
5. ✅ Apply for own leave
6. ✅ Upload mess menus
7. ✅ View mess feedback
8. ✅ View students in their hostel

**Admins Can:**
1. ✅ Approve new users
2. ✅ View all system data
3. ✅ Access analytics dashboard
4. ✅ Review caretaker leaves
5. ✅ Assign replacement caretakers
6. ✅ Monitor mess operations
7. ✅ Access audit logs
8. ✅ Manage all hostels

### 🚀 Quick Start Checklist

- [ ] Clone repository
- [ ] Install dependencies (frontend & backend)
- [ ] Create Supabase project
- [ ] Run database schema scripts
- [ ] Configure environment variables
- [ ] Start backend server (port 3001)
- [ ] Start frontend server (port 3000)
- [ ] Register admin account
- [ ] Test the application
- [ ] Read complete documentation

### 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | This file - complete project overview |
| `SUPABASE_SETUP.md` | Detailed database setup guide |
| `AUTH_README.md` | Authentication system documentation |
| `PROJECT_STRUCTURE.md` | Code organization and architecture |
| `backend/README.md` | Backend API documentation |
| `backend/POSTMAN_TESTING_GUIDE.md` | API testing instructions |
| `leave-application.md` | Leave management system docs |
| `mess-feature.md` | Mess management system docs |
| `*-schema.sql` | Database schema files |

### 🔄 Development Status

**Current Focus:** Maintaining and enhancing existing features

**Recent Updates:**
- ✅ Leave management system (Jan 2026)
- ✅ Mess management with feedback (Jan 2026)
- ✅ Enhanced lost & found with datetime (Jan 2026)
- ✅ Comprehensive documentation (Jan 2026)

**Known Issues:** None critical - see GitHub Issues for enhancements

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
- ✅ Leave application system (student & caretaker)
- ✅ Mess management with menu upload and feedback

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
