# 📘 Project Best Practices

## 1. Project Purpose
Soll Vilaiyattu is a daily Tamil word puzzle application. Students log in (or play as guests), solve a daily puzzle by forming valid Tamil words that include a required center letter, and submit their results to a leaderboard. The project includes:
- Frontend: React + TypeScript (Vite) with Tailwind/shadcn-ui for UI and React Router for navigation.
- Backend: Express (ESM) + Mongoose for a REST-style API that fronts MongoDB.
- Domain: Students, daily word puzzles, gameplay progress, and leaderboard submissions. Includes simple admin login and ad configuration.

## 2. Project Structure
- Root
  - server.js: Express API server, JWT login, generic MongoDB endpoint, health checks, and DB connection lifecycle.
  - server/
    - models.js: Central Mongoose model registry for API operations.
    - cron.js: Node-cron job to reset leaderboard daily (midnight) by clearing leaderboard_score.
  - src/
    - App.tsx, main.tsx: React app entry, providers (React Query, Tooltips, Auth), and routes.
    - pages/: Route-level components (Index, AdminDashboard, Leaderboard, NotFound).
    - components/: UI and feature components; components/ui/ contains shadcn primitives.
    - contexts/: AuthContext handling admin auth via backend login.
    - hooks/: Custom hooks (useGameState orchestrates core gameplay state and persistence).
    - integrations/mongodb/: Browser client wrapper over the backend /api/mongodb endpoint + typed table definitions.
    - lib/: DB connection helper for scripts and internal utilities.
    - models/: Mongoose models (TypeScript) mirroring domain entities (for scripts and typing).
    - scripts/: Initialization/import scripts for DB seeding.
    - utils/: Tamil-specific utilities (e.g., grapheme clustering) and letters.
  - public/, index.html: Client static assets. Vite dev server runs at 8080; proxy passes /api to 3001.
  - Configuration: vite.config.ts, tailwind.config.ts, eslint.config.js, tsconfig.*.json, .env.

Responsibilities and separation of concerns:
- Frontend uses a typed HTTP wrapper (mongodb client) to call backend endpoints; it holds UI, gameplay, and client-side persistence.
- Backend handles DB operations, auth (JWT), and generic CRUD via a single /api/mongodb endpoint using models from server/models.js.
- Scripts (src/scripts/*) manage DB initialization/seeding outside the runtime server.

Entry points and setup:
- npm run start runs both server (3001) and Vite dev (8080) concurrently; Vite proxies /api → server.
- Environment variables via .env: MONGODB_URI, JWT_SECRET, PORT.

## 3. Test Strategy
Current state:
- No formal unit/integration test framework in dependencies. Some manual Node scripts exist (e.g., test-api.js, test-mongodb.js) used for ad-hoc testing.

Recommended approach:
- Frontend: Add Vitest (or Jest) + React Testing Library for components, hooks, and utils.
  - Organize tests alongside files as *.test.tsx or in __tests__/ mirrors of src/.
  - Mock network calls by stubbing the mongodb client (wrap fetch), or mock window.fetch.
  - For Tamil-specific behavior, test with getGraphemeClusters and edge cases (combining marks).
- Backend: Add Jest + Supertest for API endpoints (e.g., /api/mongodb, /api/health, /game/complete if used).
  - Spin up an ephemeral test DB or mock Mongoose with in-memory MongoDB (mongodb-memory-server).
- Coverage: Aim for 80%+ on core logic (useGameState, tamilUtils, backend routing/handlers). Keep snapshot tests sparingly.

Mocking guidelines:
- Prefer dependency seams: in frontend, import the mongodb client from integrations/mongodb/client and mock its methods (from, select, eq, single, insert, update, upsert, delete, login).
- For time-dependent logic (timers, midnight resets), mock Date.now and setTimeout with fake timers.

Unit vs integration:
- Unit test pure utilities (tamilUtils, simple helpers), hooks with mocked dependencies, components in isolation.
- Integration test key flows: login, loading today’s game, adding words, saving progress, finishing game and leaderboard submission.

## 4. Code Style
Languages and modules:
- Frontend TypeScript with ESM. React 18, functional components, hooks.
- Backend Node ESM ("type": "module"). Use import/export consistently; avoid mixing CommonJS require.

Naming conventions:
- Components: PascalCase (e.g., GameHeader, WordInput).
- Files: PascalCase for components/pages; kebab-case or lowerCamelCase for utilities as already present. Keep extension consistent (.tsx for components, .ts for logic).
- Variables/functions: lowerCamelCase.

TypeScript:
- Prefer explicit typing for public APIs, context values, hooks returns. Use generics like Tables<T> to maintain end-to-end type safety.
- Avoid using any; leverage Database types in integrations/mongodb/types for table schemas.

React and hooks:
- Keep hooks pure and composable. Centralize gameplay logic in useGameState and pass minimal props to components.
- Memoize derived values (useMemo) and callbacks (useCallback) where appropriate. Avoid unnecessary re-renders.

Async and error handling:
- Use the mongodb client wrapper consistently. It returns { data, error } and may emit error codes like DB_UNAVAILABLE.
- Always check both data and error; never assume data on non-200.
- Add user feedback for network timeouts (client has AbortController timeouts; surface toasts where possible).

State and persistence:
- Use localStorage keys namespaced and unique per user (e.g., gameState_${admission_number}). Clean up on logout.
- Maintain game session timestamps in DB for resuming; do not compute from string length—use grapheme utilities.

Styling/UI:
- Tailwind CSS + shadcn-ui. Keep components reusable; do not inline large style blocks when an extracted component or utility class will do.
- Respect Tailwind content globs in tailwind.config.ts.

Linting:
- eslint.config.js extends recommended TS rules and react-hooks. Keep hooks rules enabled. Avoid disabling no-unused-vars globally in new code; prefer targeted ignores or fix unused code.

## 5. Common Patterns
MongoDB client (frontend):
- Query pattern:
  - mongodb.from('table').select('fields').eq('field', value).order('field', { ascending: true|false }).limit(n)
  - .single() to fetch one row; awaitable "then" is provided for .from() to act like a query promise if needed.
- Mutations: .insert(arrayOrObject), .update(data) with .eq filters, .upsert(data), .delete() with filters, .login(credentials).
- Handle special error codes: DB_UNAVAILABLE indicates backend DB connection issue.

Mongoose models (backend):
- All collections are exposed in server/models.js via a models map keyed by table-name strings used by API actions.
- Conform to field names in integrations/mongodb/types when adding fields to keep parity.

Grapheme-aware Tamil logic:
- Always use getGraphemeClusters for word length, validation, and scoring. Do not rely on JS string.length for Tamil text.
- Center letter inclusion is mandatory for valid words.

Daily reset and time zones:
- Cron resets leaderboard at "0 0 * * *" using server local time. If the app must align to IST, run server in IST or compute IST offsets explicitly (frontend already schedules resets based on IST offsets).

Routing and guards:
- React Router v6 with a ProtectedAdminRoute guard reading AuthContext.isAdminAuthenticated.
- Auth token persisted as admin_token in localStorage; verify with backend when hardening security.

## 6. Do's and Don'ts
✅ Do
- Use the mongodb client wrapper for all data access from the frontend; avoid raw fetch calls to /api.
- Enforce Tamil-specific string handling via tamilUtils.getGraphemeClusters.
- Keep domain types in sync between backend models, server/models.js, and integrations/mongodb/types.
- Check both data and error results from API calls and handle DB_UNAVAILABLE gracefully.
- Use environment variables for all secrets (MONGODB_URI, JWT_SECRET). Keep credentials out of source.
- Maintain separation of concerns: UI in components, domain/game logic in hooks, data access in integrations.
- Use Vite alias @ for src imports consistently.

❌ Don’t
- Don’t compute word lengths or scores with plain .length on Tamil strings.
- Don’t bypass the mongodb client or hardcode API URLs; rely on Vite’s proxy and the wrapper.
- Don’t commit secrets or sensitive URIs in code or logs. Avoid logging tokens or PII.
- Don’t mutate React state directly; use setState with copies (e.g., [...foundWords]).
- Don’t mix CommonJS require with ESM in this repo’s runtime code.

## 7. Tools & Dependencies
Key libraries:
- Frontend: React 18, React Router, @tanstack/react-query, Tailwind CSS, shadcn/radix UI, zod, date-fns.
- Backend: Express 5, Mongoose 8, bcryptjs, jsonwebtoken, node-cron, dotenv, cors.
- Tooling: Vite + SWC, TypeScript 5, ESLint, PostCSS, Tailwind.

Setup & run:
- Prerequisites: Node 18+ recommended.
- Env: create .env with MONGODB_URI and JWT_SECRET (and PORT if needed).
- Install: npm install
- Dev: npm run start (runs API on 3001 and web on 8080 with /api proxy)
- Build: npm run build; Preview: npm run preview (ensure API server is running separately)

Configuration notes:
- vite.config.ts sets alias @ → ./src and proxies /api to http://localhost:3001.
- eslint.config.js enables react-hooks rules; keep them green.
- tailwind.config.ts globs include ./src/**/*.{ts,tsx} and related folders.

## 8. Other Notes
- Frontend service worker registration expects /sw.js; ensure it exists under public/ if PWA features are desired.
- Admin auth is minimal; for production, implement token verification on load and server-side authorization checks per route.
- The backend exposes a generic /api/mongodb action-based endpoint; any new table should be added to server/models.js and typed in integrations/mongodb/types.
- Leaderboard deduplication relies on student_id + game_date uniqueness checks in code; consider DB-level unique indexes for robustness.
- For guest users, IDs may be synthetic (e.g., guest- prefixed). Be careful when deriving logic from id vs _id.
- Be mindful of IST-specific behavior in the frontend (midnight reset scheduling). Keep server behavior aligned or explicitly time-zone adjusted.
