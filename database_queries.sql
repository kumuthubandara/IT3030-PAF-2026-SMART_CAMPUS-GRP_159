-- Smart Campus Maintenance Module - MySQL Query Pack
-- Database: smart_campus_db
-- Note: Tables are auto-created by JPA (ddl-auto=update). These queries are for testing/reporting.

USE smart_campus_db;

-- =========================================================
-- 1) TICKETS
-- =========================================================

-- Create ticket
INSERT INTO tickets
    (title, description, category, priority, status, location, created_user, assigned_technician, resolution_notes, created_at, updated_at)
VALUES
    ('Projector not working', 'Projector in Lab A does not power on', 'Electrical', 'HIGH', 'OPEN', 'Lab A', 'student1', NULL, NULL, NOW(), NOW());

-- Get all tickets (latest first)
SELECT *
FROM tickets
ORDER BY created_at DESC;

-- Get tickets by user
SELECT *
FROM tickets
WHERE created_user = 'student1'
ORDER BY created_at DESC;

-- Get technician assigned tickets
SELECT *
FROM tickets
WHERE assigned_technician = 'tech1'
ORDER BY created_at DESC;

-- Filter by status + priority + keyword
SELECT *
FROM tickets
WHERE status = 'OPEN'
  AND priority = 'HIGH'
  AND (
    title LIKE '%projector%'
    OR description LIKE '%projector%'
    OR category LIKE '%projector%'
    OR location LIKE '%projector%'
  )
ORDER BY created_at DESC;

-- Assign technician
UPDATE tickets
SET assigned_technician = 'tech1',
    updated_at = NOW()
WHERE id = 1;

-- Update status with resolution notes
UPDATE tickets
SET status = 'RESOLVED',
    resolution_notes = 'Replaced faulty power cable',
    updated_at = NOW()
WHERE id = 1;

-- =========================================================
-- 2) COMMENTS
-- =========================================================

-- Add comment
INSERT INTO comments
    (ticket_id, author, message, created_at, updated_at)
VALUES
    (1, 'student1', 'Issue started this morning.', NOW(), NOW());

-- List comments for ticket
SELECT *
FROM comments
WHERE ticket_id = 1
ORDER BY created_at ASC;

-- Edit own comment
UPDATE comments
SET message = 'Issue started this morning around 8 AM.',
    updated_at = NOW()
WHERE id = 1
  AND author = 'student1';

-- Delete comment
DELETE FROM comments
WHERE id = 1
  AND author = 'student1';

-- =========================================================
-- 3) ATTACHMENTS (MAX 3 LOGIC ENFORCED IN SERVICE)
-- =========================================================

-- Add attachment image URL
INSERT INTO attachments
    (ticket_id, image_url, created_at)
VALUES
    (1, 'https://example.com/images/projector-1.jpg', NOW());

-- Count attachments for a ticket
SELECT ticket_id, COUNT(*) AS attachment_count
FROM attachments
WHERE ticket_id = 1
GROUP BY ticket_id;

-- List attachment URLs
SELECT id, ticket_id, image_url, created_at
FROM attachments
WHERE ticket_id = 1
ORDER BY created_at ASC;

-- =========================================================
-- 4) NOTIFICATIONS
-- =========================================================

-- Add notification
INSERT INTO ticket_notifications
    (recipient, message, ticket_id, `read`, created_at)
VALUES
    ('student1', 'Ticket status changed to IN_PROGRESS', 1, FALSE, NOW());

-- Get notifications for current user
SELECT *
FROM ticket_notifications
WHERE recipient = 'student1'
ORDER BY created_at DESC;

-- Mark notification as read
UPDATE ticket_notifications
SET `read` = TRUE
WHERE id = 1;

-- =========================================================
-- 5) ACTIVITY LOG
-- =========================================================

-- Add activity entry
INSERT INTO ticket_activities
    (ticket_id, actor, action, created_at)
VALUES
    (1, 'admin1', 'Assigned technician: tech1', NOW());

-- Timeline for a ticket
SELECT *
FROM ticket_activities
WHERE ticket_id = 1
ORDER BY created_at DESC;

-- =========================================================
-- 6) SLA / REPORTING QUERIES
-- =========================================================

-- Active tickets older than 48 hours (SLA risk)
SELECT
    id,
    title,
    status,
    created_at,
    TIMESTAMPDIFF(HOUR, created_at, NOW()) AS age_hours
FROM tickets
WHERE status IN ('OPEN', 'IN_PROGRESS')
  AND TIMESTAMPDIFF(HOUR, created_at, NOW()) > 48
ORDER BY age_hours DESC;

-- Resolution time report for closed/resolved tickets
SELECT
    id,
    title,
    status,
    created_at,
    updated_at,
    TIMESTAMPDIFF(HOUR, created_at, updated_at) AS resolution_hours
FROM tickets
WHERE status IN ('RESOLVED', 'CLOSED')
ORDER BY updated_at DESC;

-- Summary counts by status
SELECT status, COUNT(*) AS total
FROM tickets
GROUP BY status
ORDER BY total DESC;

-- Summary counts by priority
SELECT priority, COUNT(*) AS total
FROM tickets
GROUP BY priority
ORDER BY total DESC;

-- =========================================================
-- 7) REPAIR: ticket_notifications (MySQL reserved word `read`)
-- =========================================================
-- If Hibernate failed to create this table earlier, drop it and restart the backend
-- so JPA can recreate it with column `is_read` instead of `read`.

-- DROP TABLE IF EXISTS ticket_notifications;

