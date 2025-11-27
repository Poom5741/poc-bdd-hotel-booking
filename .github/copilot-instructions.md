# StayFlex Monorepo - AI Agent Instructions

## Architecture Overview

**Monorepo Structure**: Hotel booking system with Go backend API and dual Next.js frontends (guest + admin).

**Backend (Go)**: Hexagonal architecture with strict layer separation:
- `domain/` - Business entities (e.g., `Room`, `Booking`, `User`)
- `ports/` - Interfaces for repositories and external dependencies
- `app/` - Business logic/use cases (e.g., `Service` types)
- `adapters/` - HTTP handlers and infrastructure implementations

**Module Organization**: Three core modules under `backend/hotel-api/internal/`:
- `auth/` - User authentication (role-based: guest/admin)
- `room/` - Room search and admin management
- `booking/` - Booking creation, listing, cancellation

**Data Flow**: All services use `InMemoryStore` (in `seed/` package) which implements all repository interfaces. The store is seeded on startup with test data.

## Critical Patterns

### Backend: Service Construction
Services require repository interfaces via constructor injection:
```go
// booking/app/service.go
func NewService(bookings bookingports.BookingRepository, rooms roomports.RoomRepository) *Service
```

Always pass the same `store` instance when wiring in `main.go` to share data across modules.

### Backend: HTTP Handlers
Handlers are in `adapters/http/` and follow this pattern:
```go
func NewHandler(svc *app.Service) http.Handler
```
Route registration in `main.go` uses path prefixes (e.g., `/api/guest/rooms/search`, `/api/admin/bookings/`).

### Frontend: Dual-App Routing via Nginx
- **Guest app** (`apps/guest-web`) serves root `/`
- **Admin app** (`apps/admin-web`) serves `/admin/` (reverse proxied by nginx)
- Both apps run on port 3000 internally; nginx exposes port 3000 externally

### Frontend: Auth Middleware Pattern
Each Next.js app has `middleware.js` with different cookie names:
- Guest: `auth_token` cookie protects `/dashboard`
- Admin: `admin_auth_token` protects `/admin/*` routes (except login)
- Admin middleware also blocks guest users (has `auth_token` but no `admin_auth_token`) from accessing admin routes

API calls use `NEXT_PUBLIC_API_BASE` env var (set to `http://host.docker.internal:8080` in docker-compose).

### Testing: BDD with Playwright
Uses `playwright-bdd` to convert Cucumber `.feature` files into Playwright tests:
1. **Features**: `tests/e2e/features/{admin,guest}/*.feature` - Gherkin scenarios
2. **Steps**: `tests/e2e/steps/{admin,guest}/*.js` - Step implementations using `createBdd()`
3. **Pages**: `tests/e2e/pages/{admin,guest}/*.js` - Page Object Models (e.g., `RoomSearchPage`)

**Key workflow**: Run `npm run pretest` (calls `bddgen`) to generate Playwright test files before executing tests.

## Developer Workflows

### Running the Full Stack
```bash
make compose-up  # Builds and starts hotel-api, guest-web, admin-web, nginx
# Access: http://localhost:3000 (guest), http://localhost:3000/admin (admin)
```

### Running E2E Tests
```bash
make compose-e2e  # Runs tests against running stack
# Or directly: cd tests/e2e && npm run pretest && npm test
```

### Seeding Data
The API auto-seeds on startup. Seeded test users:
- Admin: `admin@stayflex.test` / `admin123`
- Guests: `guest1@stayflex.test` / `password123`, `guest2@stayflex.test` / `password456`

Rooms seeded: `room-101`, `room-102`, `room-201` (Deluxe Suite), `room-301`

### Adding New Features

**Backend (Go)**:
1. Define domain entity in `{module}/domain/`
2. Add repository interface to `{module}/ports/`
3. Implement business logic in `{module}/app/service.go`
4. Create HTTP handler in `{module}/adapters/http/`
5. Wire in `cmd/hotel-api/main.go` and register routes
6. Update `seed/memory_store.go` if new repository methods added

**Frontend (Next.js)**:
1. Add page in `apps/{guest-web,admin-web}/pages/`
2. Update `middleware.js` if route requires auth
3. Use `process.env.NEXT_PUBLIC_API_BASE` for API calls

**E2E Tests**:
1. Write `.feature` file in `tests/e2e/features/{admin,guest}/`
2. Implement steps in `tests/e2e/steps/{admin,guest}/` using `Given/When/Then` from `createBdd()`
3. Create/update Page Object in `tests/e2e/pages/{admin,guest}/` if needed
4. Run `npm run bddgen` to generate test specs

## Common Gotchas

- **Port conflicts**: API uses 8080, web uses 3000. Docker services use `host.docker.internal` to reach host.
- **CORS**: Handled in `main.go` with wildcard origin (`*`) - adjust for production.
- **Service wiring**: All modules share the same `store` instance. Don't create separate stores or data won't be shared.
- **BDD test generation**: Always run `bddgen` after modifying `.feature` files before running tests.
- **Role separation**: Guest and admin have separate login flows, cookies, and middleware. Don't mix tokens.
- **Time.Time usage**: Services inject `nowFn func() time.Time` for testability (see `booking/app/service.go`).
- **Context handling**: All repository methods accept `context.Context` - check for cancellation at method start.

## Key Files Reference

- **API entry**: `backend/hotel-api/cmd/hotel-api/main.go` - service wiring, route registration
- **Seeding**: `backend/hotel-api/internal/seed/seeder.go` - test data definitions
- **Nginx routing**: `nginx.conf` - admin/guest app routing logic
- **Test config**: `tests/e2e/playwright.config.js` - BDD setup, base URL configuration
- **Guest middleware**: `apps/guest-web/middleware.js` - guest auth logic
- **Admin middleware**: `apps/admin-web/middleware.js` - admin auth + guest blocking logic
