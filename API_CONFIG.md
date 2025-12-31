# API Configuration

## Environment Variables
The application uses the following environment variables:
- `VITE_API_BASE_URL`: Base URL of your API (default: `http://localhost:8989`)
- `VITE_USE_MOCK_DATA`: Use static data instead of the API (`true`/`false`)

## Configuration for development
1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
2. Edit `.env.local` with your settings:
```
VITE_API_BASE_URL=http://votre-api-server:port
VITE_USE_MOCK_DATA=false  # true for static data, false for the real API
   ```
## Development mode with static data
To develop the frontend without an active API server:
1. **Option 1 - Environment variable**:
```bash
# In .env.local
   VITE_USE_MOCK_DATA=true
   ```
2. **Option 2 - Vite configuration**:
```typescript
// In vite.config.ts
const USE_MOCK_DATA = true;
```
With this configuration:
- ✅ All dashboard data will be served via static data on the client side
- ✅ The user will be automatically logged in (no authentication required)
- ✅ A “Development Mode” indicator will appear in the header
- ✅ Logout works, but the user will be reconnected upon refresh

## Configuration for production
Set the `VITE_API_BASE_URL` environment variable during the build:
```bash
VITE_API_BASE_URL=https://domain-api.com npm run build
```
## API endpoints
The application expects these endpoints on your API server:
- `POST /dashdata/login`: Authentication with `{ username, password }`
- Returns: `{ token, user: { id, email, name? } }`
- `GET /dashdata/data`: Dashboard data (requires Bearer authentication)
- Returns: `{ totalPublications, totalUsers, licensesLast12Months, licensesLastWeek, oldestLicenseDate, totalLicensesSinceStart }`
- `GET /dashdata/overshared`: Overshared licenses (requires Bearer authentication)
- `PUT /dashdata/revoke`: A revoke command sent through the dashboard (requires Bearer authentication)

## Development proxy
The `vite.config.ts` file is configured with a proxy to redirect `/dashdata/*` requests to your API server during development. This avoids CORS issues during this phase.

## Architecture
- `src/lib/api.ts`: Endpoint and helper configuration
- `src/lib/apiService.ts`: HTTP service with error handling
- `src/contexts/AuthContext.tsx`: Authentication context
- `src/hooks/useDashboardData.ts`: Hook to retrieve dashboard data