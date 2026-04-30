# Migrate from Fetch to Axios

## Goal
Replace all instances of the native `fetch` API with `axios` across the frontend components and hooks to standardize data fetching and error handling.

## Tasks
- [x] Task 1: Create a centralized Axios instance in `src/lib/axios.ts` with default headers (`Content-Type: application/json`). → Verify: File exists and exports the configured instance.
- [x] Task 2: Refactor `src/hooks/useAuditLog.ts` and Dashboard Home components (`StudentDashboardHome`, `AdminDashboardHome`, `FacultyDashboardHome`) to use Axios. → Verify: Dashboard data loads correctly without fetch-related errors.
- [ ] Task 3: Refactor Settings and User Management components (`SettingsTabs.tsx`, `UserManagementClient.tsx`) to use Axios and update error handling (use `error.response?.data` instead of `response.json()`). → Verify: User profiles and settings can be fetched and updated.
- [ ] Task 4: Refactor academic module pages (grades, classes, attendance, timetable, courses, faculty, students) under `src/app/dashboard/` to use Axios. → Verify: Academic data tables and lists populate correctly.
- [ ] Task 5: Refactor remaining administrative & utility pages (admissions, dues, announcements, quizzes, question-bank, feedback) to use Axios. → Verify: Administrative pages load their respective data successfully.
- [ ] Task 6: Search the codebase for any remaining `fetch(` usage and replace them if found. → Verify: `grep -r "fetch(" src/` yields no results for API calls.

## Done When
- [ ] Native `fetch` is completely replaced by `axios` for all API calls in the `src/` directory.
- [ ] Build process (`bun run build`) completes successfully without type errors related to responses.
- [ ] Manual verification confirms that data loads correctly across different roles in the dashboard.
