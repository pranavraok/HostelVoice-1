# Backend API Testing Guide - Postman

Complete guide to test all HostelVoice backend endpoints in Postman.

## 🚀 Prerequisites

### 1. Start the Backend Server

```bash
cd backend
npm install
npm run dev
```

The server should be running on `http://localhost:3001`

### 2. Get Supabase Auth Token

You need a valid Supabase access token from your frontend. Here's how:

**Option A: Get token from already logged-in frontend**

1. Open your Next.js frontend (http://localhost:3000)
2. Log in with a test user
3. Open browser DevTools → Console
4. Paste:

```javascript
const session = await supabase.auth.getSession();
console.log(session.data.session.access_token);
```

4. Copy the token

**Option B: Get token via Supabase CLI**

```bash
supabase auth users list
# Then get the token from your test user
```

---

## 📋 Postman Setup

### Create Environment Variables

1. Open Postman → Click "Environments" → Click "Create"
2. Name it: `HostelVoice Local`
3. Add these variables:

| Variable   | Initial Value           | Current Value                |
| ---------- | ----------------------- | ---------------------------- |
| `base_url` | http://localhost:3001   | http://localhost:3001        |
| `token`    | (paste your token here) | (your_supabase_access_token) |

Save the environment

### Common Headers for All Requests

Add these headers to every request:

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

---

## ✅ API Testing Workflow

### Step 1: Health Check (No Auth Required)

**GET** `{{base_url}}/health`

No headers needed.

```json
Expected Response:
{
  "success": true,
  "message": "HostelVoice API is running",
  "timestamp": "2026-01-27T...",
  "environment": "development"
}
```

---

### Step 2: Issues API

#### Create an Issue

**POST** `{{base_url}}/api/issues`

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**

```json
{
  "title": "AC not working in Room 101",
  "description": "The air conditioner is not cooling the room. Temperature is stuck at 28 degrees.",
  "category": "maintenance",
  "priority": "high",
  "hostel_name": "North Wing Hostel",
  "room_number": "101",
  "location": "Room 101, First Floor"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "AC not working in Room 101",
    "status": "pending",
    "priority": "high",
    "reporter": {...}
  }
}
```

**💾 Save the `issue_id` from response for later tests**

---

#### Get My Issues

**GET** `{{base_url}}/api/issues/my?page=1&limit=10`

**Expected Response:**

```json
{
  "success": true,
  "message": "Issues retrieved successfully",
  "data": [
    {
      "id": "...",
      "title": "...",
      "status": "pending",
      ...
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

#### Get All Issues (Staff Only)

**GET** `{{base_url}}/api/issues?page=1&limit=10&status=pending`

**Query Parameters (Optional):**

- `status`: pending, in_progress, resolved, closed
- `category`: maintenance, cleanliness, security, food, other
- `priority`: low, medium, high, urgent
- `search`: search in title/description

---

#### Get Single Issue

**GET** `{{base_url}}/api/issues/{{issue_id}}`

Replace `{{issue_id}}` with the ID from Step 1.

---

#### Assign Issue to Caretaker (Staff Only)

**PATCH** `{{base_url}}/api/issues/{{issue_id}}/assign`

**Body:**

```json
{
  "assigned_to": "caretaker-user-uuid",
  "notes": "Assigning to check AC immediately"
}
```

**Note:** You need the UUID of a caretaker user. Get it from:

- Supabase Dashboard → Authentication → Users
- Or query: `SELECT id FROM users WHERE role='caretaker' LIMIT 1`

---

#### Update Issue Status (Staff Only)

**PATCH** `{{base_url}}/api/issues/{{issue_id}}/status`

**Body:**

```json
{
  "status": "in_progress",
  "notes": "Started repair work on the AC unit"
}
```

**Status options:** pending, in_progress, resolved, closed

---

#### Find Duplicate Issues

**GET** `{{base_url}}/api/issues/{{issue_id}}/duplicates?limit=5`

Returns potential duplicate issues with similar category/hostel.

---

#### Merge Issues (Staff Only)

**POST** `{{base_url}}/api/issues/merge`

**Body:**

```json
{
  "master_issue_id": "issue-1-uuid",
  "duplicate_issue_ids": ["issue-2-uuid", "issue-3-uuid"],
  "merge_notes": "Merging duplicate AC complaints from same room"
}
```

---

### Step 3: Announcements API

#### Create Announcement (Staff Only)

**POST** `{{base_url}}/api/announcements`

**Body:**

```json
{
  "title": "Water Supply Maintenance",
  "content": "The water supply will be cut off from 2 AM to 6 AM on Friday for maintenance. Please store water beforehand.",
  "category": "maintenance",
  "priority": "high",
  "target_role": "all",
  "target_hostel": "North Wing Hostel",
  "expires_at": "2026-02-03T23:59:59Z"
}
```

**Category options:** general, urgent, maintenance, event, policy
**Priority options:** normal, high, urgent
**Target role options:** all, student, caretaker, admin

---

#### Get Targeted Announcements

**GET** `{{base_url}}/api/announcements?page=1&limit=10&category=maintenance`

Returns announcements targeted to your role and hostel.

---

#### Get All Announcements (Staff Only)

**GET** `{{base_url}}/api/announcements/all?page=1&limit=10`

---

#### Get Single Announcement

**GET** `{{base_url}}/api/announcements/{{announcement_id}}`

---

#### Update Announcement (Creator/Admin Only)

**PATCH** `{{base_url}}/api/announcements/{{announcement_id}}`

**Body:**

```json
{
  "title": "Updated Water Supply Maintenance",
  "content": "Updated timing to 3 AM to 7 AM",
  "priority": "urgent"
}
```

---

#### Toggle Announcement Active Status

**PATCH** `{{base_url}}/api/announcements/{{announcement_id}}/toggle`

No body needed. Toggles between active/inactive.

---

#### Delete Announcement (Creator/Admin Only)

**DELETE** `{{base_url}}/api/announcements/{{announcement_id}}`

No body needed.

---

### Step 4: Lost & Found API

#### Report Lost/Found Item

**POST** `{{base_url}}/api/lostfound`

**Body:**

```json
{
  "item_name": "Blue Backpack",
  "description": "Navy blue backpack with laptop compartment, lost near library",
  "type": "lost",
  "category": "accessories",
  "location_lost": "Library near main gate",
  "date_lost": "2026-01-27T10:30:00Z",
  "contact_info": "9876543210"
}
```

**Type options:** lost, found
**Category options:** electronics, documents, clothing, accessories, books, other

---

#### Get Open Items

**GET** `{{base_url}}/api/lostfound?page=1&limit=10&type=lost`

**Query parameters:** type, category, search

---

#### Get My Items

**GET** `{{base_url}}/api/lostfound/my?page=1&limit=10`

---

#### Get All Items (Staff Only)

**GET** `{{base_url}}/api/lostfound/all?page=1&limit=10`

---

#### Get Single Item

**GET** `{{base_url}}/api/lostfound/{{item_id}}`

---

#### Claim an Item

**PATCH** `{{base_url}}/api/lostfound/{{item_id}}/claim`

**Body:**

```json
{
  "notes": "This is my backpack, has my initials inside"
}
```

---

#### Close an Item

**PATCH** `{{base_url}}/api/lostfound/{{item_id}}/close`

**Body:**

```json
{
  "status": "returned",
  "notes": "Item successfully returned to owner"
}
```

**Status options:** returned, closed

---

### Step 5: Residents API

#### Add Resident Profile

**POST** `{{base_url}}/api/residents`

**Body:**

```json
{
  "guardian_name": "Rajesh Kumar",
  "guardian_phone": "+91 9876543210",
  "guardian_email": "rajesh@email.com",
  "permanent_address": "123 Main Street, Delhi 110001",
  "blood_group": "O+",
  "emergency_contact": "9876543210",
  "check_in_date": "2025-08-01T00:00:00Z"
}
```

---

#### Get My Profile

**GET** `{{base_url}}/api/residents/me`

---

#### Update My Profile

**PATCH** `{{base_url}}/api/residents/me`

**Body:**

```json
{
  "guardian_phone": "+91 9999999999",
  "medical_conditions": "Allergic to peanuts"
}
```

---

#### Get All Residents (Staff Only)

**GET** `{{base_url}}/api/residents?page=1&limit=10`

---

#### Get Residents by Hostel (Staff Only)

**GET** `{{base_url}}/api/residents/hostel/North%20Wing%20Hostel?page=1&limit=10`

---

### Step 6: Notifications API

#### Get Notifications

**GET** `{{base_url}}/api/notifications?page=1&limit=20&unread=true`

**Query parameters:**

- `page`: page number
- `limit`: items per page
- `unread`: true/false

---

#### Get Unread Count

**GET** `{{base_url}}/api/notifications/count`

```json
{
  "success": true,
  "message": "Unread count retrieved",
  "data": {
    "count": 5
  }
}
```

---

#### Mark as Read

**PATCH** `{{base_url}}/api/notifications/read`

**Body:**

```json
{
  "notification_ids": ["notif-id-1", "notif-id-2"]
}
```

---

#### Mark All as Read

**PATCH** `{{base_url}}/api/notifications/read-all`

No body needed.

---

### Step 7: Analytics API

#### Dashboard Stats

**GET** `{{base_url}}/api/analytics/dashboard`

Returns: total issues, pending, this month stats, users, announcements, lost/found

---

#### Issues Summary

**GET** `{{base_url}}/api/analytics/issues-summary?hostel_name=North%20Wing%20Hostel`

Returns: issue counts by status, category, priority

---

#### Resolution Time

**GET** `{{base_url}}/api/analytics/resolution-time?category=maintenance`

Returns: average resolution time by category

---

#### Category Frequency

**GET** `{{base_url}}/api/analytics/category-frequency?period=30`

Returns: issue frequency by category in last N days

---

#### Hostel Density (Admin Only)

**GET** `{{base_url}}/api/analytics/hostel-density?period=30`

Returns: issues by hostel

---

#### Status Trends

**GET** `{{base_url}}/api/analytics/status-trends?period=30`

Returns: weekly issue trends

---

### Step 8: Upload API

#### Get Signed Upload URL

**POST** `{{base_url}}/api/upload/signed-url`

**Body:**

```json
{
  "bucket": "issue-images",
  "filename": "issue-photo.jpg",
  "contentType": "image/jpeg"
}
```

**Bucket options:** issue-images, lost-found-images, announcement-attachments, resident-documents

**Response:**

```json
{
  "success": true,
  "data": {
    "signedUrl": "https://your-project.supabase.co/storage/v1/upload/...",
    "path": "user-id/timestamp-random-filename.jpg",
    "expiresIn": 3600,
    "bucket": "issue-images"
  }
}
```

---

#### Get Public URL

**GET** `{{base_url}}/api/upload/public-url?bucket=issue-images&path=user-id/filename.jpg`

**Response:**

```json
{
  "success": true,
  "data": {
    "publicUrl": "https://your-project.supabase.co/storage/v1/object/public/issue-images/..."
  }
}
```

---

#### List My Files

**GET** `{{base_url}}/api/upload/my-files/issue-images`

Returns: list of files uploaded by current user

---

#### Delete File

**DELETE** `{{base_url}}/api/upload/file`

**Body:**

```json
{
  "bucket": "issue-images",
  "path": "user-id/filename.jpg"
}
```

---

### Step 9: Admin API (Admin Only)

#### Get Pending Users

**GET** `{{base_url}}/api/admin/pending-users?page=1&limit=10`

---

#### Approve User

**PATCH** `{{base_url}}/api/admin/approve-user`

**Body:**

```json
{
  "user_id": "student-user-uuid"
}
```

---

#### Reject User

**PATCH** `{{base_url}}/api/admin/reject-user`

**Body:**

```json
{
  "user_id": "student-user-uuid",
  "rejection_reason": "Incomplete registration details"
}
```

---

#### Get All Users

**GET** `{{base_url}}/api/admin/users?page=1&limit=10&role=student`

**Query parameters:**

- `role`: student, caretaker, admin
- `approval_status`: pending, approved, rejected
- `search`: search by name/email/ID

---

#### Get Audit Logs

**GET** `{{base_url}}/api/admin/audit-logs?page=1&limit=50`

**Query parameters:**

- `entity_type`: issue, announcement, lost_found, user, resident, notification
- `action`: create, update, delete, approve, reject, assign, merge
- `user_id`: filter by user

---

#### Get System Stats

**GET** `{{base_url}}/api/admin/stats`

Returns: users by role, issues by status, today's activity

---

#### Get Hostels

**GET** `{{base_url}}/api/admin/hostels`

Returns: list of hostels with student count

---

## 🧪 Complete Testing Checklist

Create a new Postman Collection and use this checklist:

```
✓ Health Check
✓ Create Issue
✓ Get My Issues
✓ Get All Issues (as staff)
✓ Get Single Issue
✓ Assign Issue (as staff)
✓ Update Issue Status (as staff)
✓ Create Announcement (as staff)
✓ Get Announcements
✓ Report Lost/Found Item
✓ Get My Lost/Found Items
✓ Add Resident Profile
✓ Get My Resident Profile
✓ Get Notifications
✓ Get Unread Count
✓ Mark Notification as Read
✓ Get Analytics Dashboard (as staff)
✓ Get Upload Signed URL
✓ Get Pending Users (as admin)
✓ Approve User (as admin)
✓ Get Audit Logs (as admin)
✓ Get System Stats (as admin)
```

---

## 🐛 Troubleshooting

### "Invalid or expired access token"

- Token expired. Get a new one from frontend
- Check token is copied exactly without extra spaces
- Make sure header is: `Authorization: Bearer {{token}}`

### "Access denied"

- Your role doesn't have permission for this endpoint
- Staff endpoints need caretaker or admin role
- Admin endpoints need admin role only

### "User profile not found"

- Your user hasn't been approved yet
- Admin must approve your account first
- Check in `/api/admin/pending-users`

### "User is not approved"

- Your account is pending or rejected
- Admin approval is required

---

## 💡 Tips

- Use **Environment Variables** for `base_url` and `token`
- Create separate **Postman Folders** for each API module
- Use **Tests** tab to validate responses
- Export collection and share with team
- Save responses as examples for documentation

---

**Ready to test? Start with Health Check! 🚀**
