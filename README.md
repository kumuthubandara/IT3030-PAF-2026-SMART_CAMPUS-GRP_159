# Smart Campus Maintenance Module

This project contains a Spring Boot backend and React frontend for a maintenance ticket management workflow.

## Implemented Features

- Ticket lifecycle with transition validation: `OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED` (+ `REJECTED`)
- Role-based access (`USER`, `ADMIN`, `TECHNICIAN`)
- Ticket assignment to technician (admin-only)
- Ticket comments (add/edit/delete with ownership checks)
- Ticket image attachments (maximum 3 per ticket)
- Ticket notifications
- Ticket activity timeline (audit log)
- Ticket filtering and search (`status`, `priority`, keyword `q`)
- SLA metrics:
  - `ageHours`
  - `resolutionHours`
  - `slaBreached` (>48h for active tickets)
- CSV report export for admin users

## Tech Stack

- Backend: Spring Boot, Spring Security, Spring Data JPA, MySQL
- Frontend: React, React Router, Vite

## Project Structure

- `backend/` - Spring Boot API
- `frontend/` - React web app
- `database_queries.sql` - ready-to-run MySQL query pack for demo/testing/reporting

## Local Run

### 1) Backend

From `backend/`:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend URL: `http://localhost:8080`

### 2) Frontend

From `frontend/`:

```powershell
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

Optional API base override:

- `VITE_API_BASE_URL=http://localhost:8080`

## Demo Credentials

Configured in backend in-memory security:

- User: `student1` / `1234`
- Admin: `admin1` / `1234`
- Technician: `tech1` / `1234`

## Key API Endpoints

- `POST /api/tickets`
- `GET /api/tickets?status=&priority=&q=`
- `GET /api/tickets/{id}`
- `PUT /api/tickets/{id}/status`
- `PUT /api/tickets/{id}/assign/{technicianUsername}`
- `POST /api/tickets/{id}/comments`
- `PUT /api/tickets/{ticketId}/comments/{commentId}`
- `DELETE /api/tickets/{ticketId}/comments/{commentId}`
- `POST /api/tickets/{id}/attachments`
- `GET /api/tickets/{id}/activities`
- `GET /api/tickets/export` (admin only, CSV)
- `GET /api/notifications`

## Validation and Business Rules

- Ticket starts as `OPEN`
- Only admin can assign technicians
- Technicians can update only assigned tickets
- Invalid status transitions are rejected
- `resolutionNotes` required when moving to `RESOLVED` or `CLOSED`
- Maximum 3 attachments per ticket

## Quick Test Checklist

- Create ticket as user
- Assign technician as admin
- Progress status as technician (`OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED`)
- Add comments and verify permissions
- Add attachments and verify max-3 limit
- Verify notifications and activity timeline
- Filter/search tickets
- Export CSV as admin
