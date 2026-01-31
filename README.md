<div align="center">
  <img src="./public/logo/logo.png" alt="HostelVoice Logo" width="200" />
  
  # Smart Hostel Management System

  <p>A comprehensive full-stack hostel management solution with <strong>Next.js 16</strong> frontend, <strong>Express.js</strong> backend API, and <strong>Supabase</strong> database. Features secure role-based authentication, real-time issue tracking, announcements, lost & found management, leave management, mess management, and analytics dashboard.</p>

  [![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-4.21-green)](https://expressjs.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)
</div>

---

## 👥 Meet Our Team

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="./public/team/PR.png" alt="Pranav" width="180" style="border-radius: 10px;" />
        <br />
        <strong>Pranav</strong>
        <br />
        <em>UI/UX & Frontend Developer</em>
        <br />
        <sub>React Components • User Interface • Design System</sub>
      </td>
      <td align="center">
        <img src="./public/team/TU.png" alt="Tushar" width="180" style="border-radius: 10px;" />
        <br />
        <strong>Tushar</strong>
        <br />
        <em>Backend Architect & DevOps </em>
        <br />
        <sub>Backend Architecture • API Design • Database Schema </sub>
      </td>
    </tr>
  </table>
</div>

---

## 🎬 Demo Video

<div align="center">

### Watch HostelVoice in Action!

[![Demo Video](https://img.shields.io/badge/▶_Watch_Demo-Google_Drive-4285F4?style=for-the-badge&logo=googledrive&logoColor=white)](YOUR_GOOGLE_DRIVE_LINK_HERE)

📺 **[Click here to watch the full demo video](https://drive.google.com/file/d/185gHpxmdteuApplxYByfWlYYzjaGto9i/view?usp=sharing)**

*The demo showcases all features including user registration, issue tracking, leave management, mess system, and analytics dashboard.*

</div>

---

## 📋 Table of Contents

- [Demo Video](#-demo-video)
- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [System Architecture](#-system-architecture)
- [User Journey Flows](#-user-journey-flows)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Security Implementation](#-security-implementation)
- [Database Design](#-database-design)
- [Quick Start](#-quick-start)
- [Project Status](#-project-status)

---

## 🎯 Problem Statement

Traditional hostel management faces several challenges:

- **Paper-based complaint systems** lead to lost requests and no tracking
- **Manual leave approvals** are time-consuming and lack transparency
- **No centralized communication** for announcements and updates
- **Lost items rarely recovered** due to inefficient reporting systems
- **Mess feedback ignored** without proper collection mechanisms
- **Caretakers overwhelmed** with unorganized student requests
- **Admins lack visibility** into hostel operations and metrics

---

## 💡 Our Solution

**HostelVoice** digitizes the entire hostel management workflow:

| Problem | HostelVoice Solution |
|---------|---------------------|
| Lost complaints | Digital issue tracking with status updates |
| Slow approvals | Instant leave applications with notification |
| Poor communication | Targeted announcements with pinning |
| Lost items never found | Smart matching & all-visible lost/found system |
| Ignored mess feedback | Structured feedback with ratings & responses |
| Overwhelmed caretakers | Organized dashboard with priorities |
| No admin visibility | Analytics dashboard with real-time metrics |

---

## 🏗️ System Architecture

### High-Level Overview

```

                              HOSTELVOICE SYSTEM                             

                                                                             
                   
                                                                      
     STUDENTS               CARETAKERS               ADMINS           
                                                                      
                   
                                                                          
                          
                                                                            
                                                                            
    
                           NEXT.JS 16 FRONTEND                            
                           (Port 3000)                                     
               
      Landing        Auth Pages     Dashboard      Role-Based     
      Page           Login/Reg      Components     Views          
               
    
                                                                            
                         HTTP REST API + JWT                                 
                                                                            
    
                         EXPRESS.JS BACKEND                                
                         (Port 3001)                                       
                          
      Controllers     Middleware      Services                      
      - Issues        - Auth JWT      - Audit Logs                  
      - Leave         - Validation    - Notify                      
      - Mess          - Error         - Analytics                   
      - Lost/Found    - RBAC                                        
                          
    
                                                                            
                         Supabase Admin Client                               
                                                                            
    
                         SUPABASE (PostgreSQL)                             
               
      users          issues         leave_apps     mess_menu      
      residents      lost_found     announce       feedback       
      audit_logs     notifies       approvals      storage        
               
    
                                                                             

```

### Architecture Pattern: Backend-First Design

```
                  
                                                                     
  Next.js 16       Express.js        Supabase      
  Frontend         HTTP     Backend API      Admin     PostgreSQL    
  (Port 3000)      REST     (Port 3001)      Client    Database      
                                                   
                  
                                                              
       Auth Only                   All Data Ops               
                                   + Audit Logs               
                                   + Notifications            
                                  
          Supabase Auth                                        
          (Login/Register)                                     
                                   
```

**Why Backend-First?**
- ✅ Centralized business logic
- ✅ Consistent authorization checks
- ✅ Complete audit trail of all actions
- ✅ Frontend never directly accesses database
- ✅ Easier to maintain and scale

---

## 🚦 User Journey Flows

### 1️⃣ Registration & Approval Flow

```
New User Registration
        
         Visits /register  Selects Role (Student/Caretaker/Admin)
        
         Fills Form  Supabase Auth creates account (password encrypted)
        
         User record created  approval_status = 'pending'
        
         Admin sees approval request  Reviews & Approves/Rejects
        
         Approved  User can access dashboard
            Rejected  Access denied with reason
```

### 2 Issue/Complaint Tracking Flow

```
Student Reports Issue                    Caretaker Manages
                                               
         Creates issue                         Sees all hostel issues
          (title, category,                      (filtered by assignment)
           priority, location)                 
                                                Assigns to staff
         Submits via API                      
                                                Updates status
         Gets notification                      (open  in_progress  resolved)
          on status changes                    
                                                Issue resolved  Student notified
         Tracks progress in dashboard             Audit log created
```

### 3 Leave Application Flow

```

                         STUDENT LEAVE FLOW                             

                                                                        
  Student                    Caretaker                    Result        
                                                                     
      Apply Leave   Reviews Request                     
       (dates, reason,                                               
        destination)            Approves   Leave    
                                     or                    Granted    
      Checks Status   Rejects   Denied   
                                     or                    w/ reason  
      Gets Notified            Needs Info   Pending  
                                                                        



                        CARETAKER LEAVE FLOW                            

                                                                        
  Caretaker                    Admin                      Result        
                                                                     
      Apply Leave   Reviews Request                     
       (dates, reason,                                               
        replacement)            Assigns Replacement   Approved 
                                                           w/ backup  
      Checks Status   Approves/Rejects  Result     
                                                           Notified   
      Gets Notified            Ensures Hostel Coverage              
                                                                        

```

### 4 Mess Management Flow

```
Caretaker Uploads Menu                  Students Interact
                                               
         Uploads menu card image               Views weekly menu
          (PNG/JPG  Supabase Storage)           (calendar format)
                                               
         Fills weekly calendar                 Downloads menu card
          (7 days  4 meals)                   
                                                Submits feedback
         System validates                       (rating + comments)
          (all meals filled)                   
                                                Sees caretaker response
         Menu visible to students

Admin monitors all hostels' mess operations & analytics
```

### 5 Lost & Found Flow

```
Item Lost                              Item Found
                                          
     Report lost item                     Report found item
      (description, location,               (description, where found,
       when lost, contact)                   current location)
                                          
              
             SMART MATCHING SYSTEM      
             - Same category            
             - Similar description      
             - Nearby location          
             - Recent timeframe         
              
                                         
                                         
             Notification sent            
             to potential owners          
                                          
     Contact & Claim 
                      
                      
               Item Returned! 
```

---

## ✨ Key Features

### 🔐 Authentication & Security

| Feature | Description |
|---------|-------------|
| Role-Based Access | Student, Caretaker, Admin with different permissions |
| Admin Approval System | New users require admin approval to join |
| JWT Authentication | Secure token-based auth with auto-refresh |
| Protected Routes | Middleware guards all dashboard pages |
| Audit Logging | Complete trail of all system actions |

### 📋 Issue & Complaint Tracking

| Feature | Description |
|---------|-------------|
| Multiple Categories | Maintenance, Cleaning, Security, Facilities, Other |
| Priority Levels | Low, Medium, High, Urgent |
| Status Tracking | Open  In Progress  Resolved |
| Assignment System | Caretakers assign issues to staff |
| Real-time Updates | Notifications on status changes |

### 🏖️ Leave Management

| Feature | Students | Caretakers |
|---------|----------|------------|
| Apply | Submit with dates & reason | Submit with replacement suggestion |
| Approval | Caretaker approves/rejects | Admin approves with coverage |
| Track | View status & comments | View calendar & assignments |
| Notifications | Status change alerts | Approval notifications |

### 🍽️ Mess Management

| Feature | Description |
|---------|-------------|
| Menu Upload | Weekly calendar with all meals (Breakfast, Lunch, Snacks, Dinner) |
| Menu Card | Image upload for physical menu display |
| Feedback System | Star ratings + comments from students |
| Response Mechanism | Caretakers respond to feedback |

### 🔍 Lost & Found

| Feature | Description |
|---------|-------------|
| Report Lost Items | Detailed form with location, time, description |
| Report Found Items | Track found items for recovery |
| Smart Matching | Algorithm notifies potential matches |
| All-Visible | Everyone can see all items for better recovery |
| Claim System | Track claimed and returned items |

### 📢 Announcements

| Feature | Description |
|---------|-------------|
| Targeted Posting | Send to All, Students only, or Staff only |
| Pin Important | Pinned announcements appear at top |
| CRUD Operations | Create, read, update, delete announcements |
| Role-Based | Only caretakers and admins can post |

### 📊 Analytics Dashboard

| Metric | Available To |
|--------|--------------|
| Total Issues (Open/Resolved) | All roles |
| Leave Statistics | Caretakers, Admins |
| User Approval Stats | Admins |
| Mess Ratings | Caretakers, Admins |
| Hostel-wise Breakdown | Admins |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library with latest features |
| **TypeScript 5.9** | Type-safe development |
| **Tailwind CSS 4.0** | Utility-first styling |
| **Shadcn/ui** | 60+ beautiful UI components |
| **Recharts** | Analytics visualizations |
| **Sonner** | Toast notifications |

### Backend

| Technology | Purpose |
|------------|---------|
| **Express.js 4.21** | Fast, minimal web framework |
| **Node.js** | JavaScript runtime |
| **TypeScript** | Type-safe backend code |
| **Zod** | Request validation schemas |
| **JWT** | Token-based authentication |

### Database & Services

| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend as a Service |
| **PostgreSQL** | Relational database |
| **Row Level Security** | Database-level access control |
| **Supabase Storage** | File uploads (menu cards) |
| **Supabase Auth** | Authentication service |

---

## 🔒 Security Implementation

### Multi-Layer Security Model

```

                     SECURITY ARCHITECTURE                       

                                                                 
  Layer 1: FRONTEND PROTECTION                                   
     
    Next.js Middleware guards /dashboard/* routes            
    AuthContext manages user state globally                  
    Role-based UI rendering (hide unauthorized features)     
     
                                                                
  Layer 2: API PROTECTION                                        
     
    JWT token required for all API calls                     
    authMiddleware verifies token on every request           
    Role-based filtering in controllers                      
    Zod validation prevents malformed requests               
     
                                                                
  Layer 3: DATABASE PROTECTION                                   
     
    Row Level Security (RLS) policies                        
    Backend uses service role (controlled bypass)            
    Foreign key constraints for data integrity               
    Check constraints for valid enum values                  
     
                                                                
  Layer 4: AUDIT & MONITORING                                    
     
    All critical actions logged to audit_logs table          
    Before/after state captured for changes                  
    User ID, IP address, timestamp recorded                  
    Complete accountability trail                            
     
                                                                 

```

### Role-Based Access Control

| Action | Student | Caretaker | Admin |
|--------|:-------:|:---------:|:-----:|
| View own issues | ✅ | ✅ | ✅ |
| View hostel issues | ❌ | ✅ | ✅ |
| Manage issues | ❌ | ✅ | ✅ |
| Post announcements | ❌ | ✅ | ✅ |
| Approve students | ❌ | ❌ | ✅ |
| Approve caretakers | ❌ | ❌ | ✅ |
| View all analytics | ❌ | ❌ | ✅ |
| Upload mess menu | ❌ | ✅ | ✅ |
| Apply student leave | ✅ | ❌ | ❌ |
| Review student leave | ❌ | ✅ | ✅ |
| Review caretaker leave | ❌ | ❌ | ✅ |

---

## 🗄️ Database Design

### Entity Relationship Overview

```

                         DATABASE SCHEMA                                  

                                                                          
                            
       USERS        ISSUES     ASSIGNMENTS       
                                                                   
     id                    id                    staff_id          
     email                 title                 issue_id          
     full_name             description                
     role                  category                                  
     hostel_name           priority                                  
     room_number           status                                    
     approval_             reported_by                               
       status              assigned_to                               
                                           
                                                                         
                                                                         
                            
     RESIDENTS             LOST_FOUND            LEAVE_APPS        
                                                                   
     guardian              item_name             user_id           
     emergency             type                  start_date        
     contacts              status                end_date          
     address               location              status            
              contact               approved_by       
                                           
                                                                          
                            
    ANNOUNCEMENTS           MESS_MENU             FEEDBACK         
                                                                   
     title                 week_start            user_id           
     content               meals_data            rating            
     target                menu_image            comment           
     is_pinned             hostel_name           response          
     created_by                                                    
                            
                                                                          
                                           
     AUDIT_LOGS           NOTIFICATIONS                              
                                                                     
     user_id               user_id                                   
     action                title                                     
     entity_type           message                                   
     old_data              is_read                                   
     new_data              type                                      
     ip_address                                                      
                                           
                                                                          

```

### Core Tables Summary

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts & profiles | role, hostel_name, approval_status |
| `issues` | Complaints/requests | category, priority, status, assigned_to |
| `announcements` | Hostel notices | target_audience, is_pinned |
| `lost_found` | Lost/found items | type, status, location, contact |
| `leave_applications` | Leave requests | start/end dates, approval status |
| `mess_menu` | Weekly menus | meals data (JSON), menu image URL |
| `mess_feedback` | Student ratings | rating (1-5), comments, response |
| `audit_logs` | Action tracking | action, old/new data, timestamp |
| `notifications` | User alerts | type, message, is_read |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

### Installation Steps

```bash
# 1. Clone repository
git clone <repository-url>
cd HostelVoice

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend && npm install && cd ..

# 4. Configure environment (see .env.example files)

# 5. Run database migrations in Supabase SQL Editor

# 6. Start backend (Terminal 1)
cd backend && npm run dev

# 7. Start frontend (Terminal 2)
npm run dev

# 8. Open http://localhost:3000
```

### First-Time Setup

1. **Register Admin account first** (auto-approved)
2. Register student/caretaker accounts
3. Login as Admin  Approve pending users
4. Users can now login and use the system

---

## 📊 Project Status

### ✅ Implemented Features (January 2026)

| Module | Status | Description |
|--------|:------:|-------------|
| Authentication | ✅ | JWT-based with role management |
| User Approval | ✅ | Admin approval workflow |
| Issue Tracking | ✅ | Full CRUD with assignment |
| Announcements | ✅ | Targeted posting with pins |
| Lost & Found | ✅ | Smart matching system |
| Student Leave | ✅ | Application & approval flow |
| Caretaker Leave | ✅ | With replacement assignment |
| Mess Menu | ✅ | Weekly calendar + image upload |
| Mess Feedback | ✅ | Ratings and response system |
| Analytics | ✅ | Role-specific dashboards |
| Audit Logging | ✅ | Complete action trail |
| Notifications | ✅ | In-app notification system |

### Code Metrics

| Metric | Count |
|--------|-------|
| Frontend Pages | 20+ |
| Backend API Endpoints | 50+ |
| UI Components | 60+ |
| Database Tables | 12+ |
| Lines of Code | ~15,000+ |

---

## 🔄 Data Flow Summary

```
User Action  React Component  API Client (lib/api.ts)
                                      
                         JWT Token Auto-Attached
                                      
                                      
                            HTTP Request  Express Backend
                                                
                               Auth Middleware Verifies Token
                                                
                                                
                              Controller Handles Business Logic
                                                
                               Role-Based Filtering Applied
                                                
                                                
                             Supabase Query (Admin Client)
                                                
                                    Data Retrieved/Modified
                                                
                                                
                              Audit Log Created  Response Sent
                                                      
                                                      
                              Frontend Receives Data  UI Updates
```

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ by Pranav & Tushar for better hostel management**

*HostelVoice - Making Hostel Life Simpler*

</div>
