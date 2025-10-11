# LCP License Hub - Dashboard

This is the React/TypeScript dashboard for the LCP Server.

## Structure

- `src/` - Source code for the React application
- `public/` - Static assets
- `components/` - Reusable UI components
- `pages/` - Application pages/routes
- `contexts/` - React contexts for state management
- `hooks/` - Custom React hooks
- `lib/` - Utility libraries and API services

## Development

### Prerequisites

- Node.js 18+ 
- npm or bun

### Installation

```bash
npm install
# or
bun install
```

### Development Server

```bash
npm run dev
# or
bun dev
```

The dashboard will be available at http://localhost:8090

### Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080

# Mock Data Configuration
# Set to 'true' to use static mock data for development
# Set to 'false' to use real API calls
VITE_USE_MOCK_DATA=false
```

### Mock Data Mode

For frontend development without needing the backend server:

1. Set `VITE_USE_MOCK_DATA=true` in `.env.local`
2. The application will use static mock data
3. Authentication is bypassed automatically

### Production Build

```bash
npm run build
# or  
bun build
```

### API Integration

The frontend communicates with the Go backend server at `/dashboard` endpoints.
In development, Vite proxy redirects these calls to the backend server.

## Features

- Authentication with JWT tokens
- Dashboard with license statistics and charts
- Overshared licenses management
- Responsive UI with Tailwind CSS
- Mock data mode for development