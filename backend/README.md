# Backend - Assignment Portal (Full)

## Setup
1. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed sample users and assignments (optional):
   ```bash
   npm run seed
   ```
4. Start server:
   ```bash
   npm run dev
   ```

## API Highlights
- POST /api/auth/login -> { token, role, name }
- GET /api/assignments?status=&page=&limit= -> paginated list (teachers can request any status)
- POST /api/assignments -> create (teacher only)
- PUT /api/assignments/:id -> edit (only Draft)
- DELETE /api/assignments/:id -> delete (only Draft)
- PUT /api/assignments/:id/status -> change state (enforced transitions)
- GET /api/assignments/:id/submissions -> teacher sees all submissions with student info
- POST /api/submissions -> student submit (one per assignment, blocked after dueDate)
- GET /api/submissions/mine/:assignmentId -> student fetch own submission
- PUT /api/submissions/:id/review -> teacher marks reviewed

Seeded users:
- teacher@example.com / teacher123
- student@example.com / student123
