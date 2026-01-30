-- =============================================
-- LEAVE APPLICATION SYSTEM - DATABASE SCHEMA
-- =============================================
-- Run this in Supabase SQL Editor
-- NOTE: This schema uses the 'users' table (not 'profiles')

-- =============================================
-- 1. DROP EXISTING TABLES (if recreating)
-- =============================================
-- Uncomment these lines if you need to recreate the tables
-- DROP TABLE IF EXISTS leave_request_comments CASCADE;
-- DROP TABLE IF EXISTS student_leave_requests CASCADE;
-- DROP TABLE IF EXISTS caretaker_leave_requests CASCADE;

-- =============================================
-- 2. STUDENT LEAVE REQUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS student_leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    hostel_name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    leave_type TEXT NOT NULL CHECK (leave_type IN ('Home Visit', 'Medical', 'Personal', 'Emergency', 'Academic', 'Other')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    total_days INT NOT NULL,
    destination TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    reason TEXT NOT NULL,
    document_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'more_info')),
    return_status TEXT NOT NULL DEFAULT 'not_returned' CHECK (return_status IN ('not_returned', 'returned', 'overdue')),
    actual_return_date TIMESTAMPTZ,
    caretaker_notes TEXT,
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_by_name TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Ensure end_date >= start_date
    CONSTRAINT valid_student_date_range CHECK (end_date >= start_date)
);

-- =============================================
-- 3. CARETAKER LEAVE REQUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS caretaker_leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caretaker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    caretaker_name TEXT NOT NULL,
    caretaker_block TEXT NOT NULL,
    leave_type TEXT NOT NULL CHECK (leave_type IN ('Casual', 'Sick', 'Emergency', 'Earned', 'Other')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason TEXT NOT NULL,
    document_url TEXT,
    replacement_suggestion TEXT,
    assigned_replacement TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'conditional', 'rejected')),
    admin_notes TEXT,
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_by_name TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Ensure end_date >= start_date
    CONSTRAINT valid_caretaker_date_range CHECK (end_date >= start_date)
);

-- =============================================
-- 4. INDEXES FOR PERFORMANCE
-- =============================================
-- Student leave indexes
CREATE INDEX IF NOT EXISTS idx_student_leave_student_id ON student_leave_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_student_leave_hostel_status ON student_leave_requests(hostel_name, status);
CREATE INDEX IF NOT EXISTS idx_student_leave_dates ON student_leave_requests(start_date, end_date);

-- Caretaker leave indexes
CREATE INDEX IF NOT EXISTS idx_caretaker_leave_caretaker_id ON caretaker_leave_requests(caretaker_id);
CREATE INDEX IF NOT EXISTS idx_caretaker_leave_block_status ON caretaker_leave_requests(caretaker_block, status);
CREATE INDEX IF NOT EXISTS idx_caretaker_leave_dates ON caretaker_leave_requests(start_date, end_date);

-- =============================================
-- 5. AUTO-UPDATE TIMESTAMPS TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_leave_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for student_leave_requests
DROP TRIGGER IF EXISTS update_student_leave_updated_at ON student_leave_requests;
CREATE TRIGGER update_student_leave_updated_at
    BEFORE UPDATE ON student_leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_leave_updated_at();

-- Trigger for caretaker_leave_requests
DROP TRIGGER IF EXISTS update_caretaker_leave_updated_at ON caretaker_leave_requests;
CREATE TRIGGER update_caretaker_leave_updated_at
    BEFORE UPDATE ON caretaker_leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_leave_updated_at();

-- =============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE student_leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE caretaker_leave_requests ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STUDENT LEAVE - RLS POLICIES
-- =============================================

-- Drop existing policies first (if recreating)
DROP POLICY IF EXISTS "student_leave_insert_own" ON student_leave_requests;
DROP POLICY IF EXISTS "student_leave_select" ON student_leave_requests;
DROP POLICY IF EXISTS "student_leave_update_caretaker" ON student_leave_requests;
DROP POLICY IF EXISTS "student_leave_update_own_return" ON student_leave_requests;

-- Students can INSERT their own leave requests
CREATE POLICY "student_leave_insert_own"
    ON student_leave_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id = auth.uid() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'student')
    );

-- SELECT: Students see own, Caretakers see their hostel, Admins see all
CREATE POLICY "student_leave_select"
    ON student_leave_requests
    FOR SELECT
    TO authenticated
    USING (
        -- Student viewing their own leaves
        (student_id = auth.uid())
        OR
        -- Caretaker viewing leaves for their hostel only
        (EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'caretaker' 
            AND hostel_name = student_leave_requests.hostel_name
        ))
        OR
        -- Admin can view all
        (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
    );

-- Caretakers can UPDATE student leaves in their hostel (status, notes, etc.)
CREATE POLICY "student_leave_update_caretaker"
    ON student_leave_requests
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'caretaker' 
            AND hostel_name = student_leave_requests.hostel_name
        )
    );

-- Students can UPDATE their own leave (only for marking return)
CREATE POLICY "student_leave_update_own_return"
    ON student_leave_requests
    FOR UPDATE
    TO authenticated
    USING (
        student_id = auth.uid() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'student')
    );

-- =============================================
-- CARETAKER LEAVE - RLS POLICIES
-- =============================================

-- Drop existing policies first (if recreating)
DROP POLICY IF EXISTS "caretaker_leave_insert_own" ON caretaker_leave_requests;
DROP POLICY IF EXISTS "caretaker_leave_select" ON caretaker_leave_requests;
DROP POLICY IF EXISTS "caretaker_leave_update_admin" ON caretaker_leave_requests;

-- Caretakers can INSERT their own leave requests
CREATE POLICY "caretaker_leave_insert_own"
    ON caretaker_leave_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        caretaker_id = auth.uid() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'caretaker')
    );

-- SELECT: Caretakers see own, Admins see all
CREATE POLICY "caretaker_leave_select"
    ON caretaker_leave_requests
    FOR SELECT
    TO authenticated
    USING (
        -- Caretaker viewing their own leaves
        (caretaker_id = auth.uid())
        OR
        -- Admin can view all
        (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
    );

-- Only admins can UPDATE caretaker leave requests
CREATE POLICY "caretaker_leave_update_admin"
    ON caretaker_leave_requests
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- =============================================
-- 7. HELPER FUNCTIONS
-- =============================================

-- Calculate days between dates
CREATE OR REPLACE FUNCTION calculate_leave_days(p_start DATE, p_end DATE)
RETURNS INT AS $$
BEGIN
    RETURN (p_end - p_start) + 1;
END;
$$ LANGUAGE plpgsql;

-- Get available caretakers for a date range
CREATE OR REPLACE FUNCTION get_available_caretakers(p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    hostel_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.full_name, u.hostel_name
    FROM users u
    WHERE u.role = 'caretaker'
    AND u.approval_status = 'approved'
    AND NOT EXISTS (
        SELECT 1 FROM caretaker_leave_requests clr
        WHERE clr.caretaker_id = u.id
        AND clr.status IN ('approved', 'conditional')
        AND (clr.start_date <= p_end_date AND clr.end_date >= p_start_date)
    );
END;
$$ LANGUAGE plpgsql;

-- Get staffing level for a specific date
CREATE OR REPLACE FUNCTION get_staffing_level(p_date DATE)
RETURNS TABLE (
    total_caretakers INT,
    available_caretakers INT,
    on_leave_caretakers INT
) AS $$
DECLARE
    v_total INT;
    v_on_leave INT;
BEGIN
    -- Count total approved caretakers
    SELECT COUNT(*) INTO v_total
    FROM users
    WHERE role = 'caretaker' AND approval_status = 'approved';
    
    -- Count caretakers on leave for the date
    SELECT COUNT(DISTINCT caretaker_id) INTO v_on_leave
    FROM caretaker_leave_requests
    WHERE status IN ('approved', 'conditional')
    AND p_date BETWEEN start_date AND end_date;
    
    RETURN QUERY SELECT v_total, (v_total - v_on_leave), v_on_leave;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 8. GRANTS
-- =============================================
GRANT ALL ON student_leave_requests TO authenticated;
GRANT ALL ON caretaker_leave_requests TO authenticated;

-- =============================================
-- SCHEMA COMPLETE!
-- =============================================
