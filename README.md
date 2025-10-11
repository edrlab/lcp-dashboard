# LCP License Hub

A web application for managing LCP (Licensed Content Protection) licenses with a Go backend and React frontend.

## Project Structure

This project is organized into two main components:

### `/server/` - Go Backend API
- RESTful API server built with Go and Chi router  
- JWT authentication system
- License management endpoints
- CORS support for frontend integration

### `/dashboard/` - React Frontend
- Modern React/TypeScript application
- Responsive dashboard with charts and statistics
- Authentication UI with protected routes
- Mock data mode for development

## Quick Start

### Backend (Go Server)

```bash
cd server
go mod tidy
go run .
```

The API server will be available at http://localhost:8080

### Frontend (React Dashboard) 

```bash  
cd dashboard
npm install
npm run dev
```

The dashboard will be available at http://localhost:8090

## Development Workflow

### Full Stack Development
1. Start the Go server: `cd server && go run .`
2. Start the React dev server: `cd dashboard && npm run dev`
3. Access the dashboard at http://localhost:8090

### Frontend-Only Development
1. Set `VITE_USE_MOCK_DATA=true` in `dashboard/.env.local`
2. Start only the React dev server: `cd dashboard && npm run dev`
3. Authentication and API calls will use mock data

## API Documentation

See [API_CONFIG.md](./API_CONFIG.md) for detailed API endpoint documentation.

## Environment Configuration

Configure each component:
- Server: Environment variables in `/server/`
- Dashboard: Copy `dashboard/.env.example` to `dashboard/.env.local`

## Technologies

**Backend:**
- Go 1.21+
- Chi router
- JWT authentication

**Frontend:**  
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn-ui components
- TanStack Query
