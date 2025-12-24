# LCP Dashboard

A web application for managing LCP (Licensed Content Protection) licenses with a React frontend and Go mock backend.

## Project Structure

This project is organized into two main components:

### `/dashboard/` - React Frontend
- Modern React/TypeScript application
- Responsive dashboard with charts and statistics
- Authentication UI with protected routes
- Mock data mode for development

### `/server/` - Test Go Backend API
- RESTful API server built with Go and Chi router  
- JWT authentication system
- License management endpoints
- CORS support for frontend integration

## Quick Start

### Backend (Go Server)

```bash
cd test-server
go mod tidy
go run .
```

The API server will be available at http://localhost:8989

### Frontend (React Dashboard) 

```bash  
cd dashboard
npm install
npm run dev
```

The dashboard will be available at http://localhost:8090

The test-server authorizes the user with name `admin` and password `supersecret`. 

## Development Workflow

### Client-Server Development
1. Start the Go server: `cd server && go run .`
2. Start the React dev server: `cd dashboard && npm run dev`
3. Access the dashboard at http://localhost:8090

### Frontend-Only Development
1. Set `VITE_USE_MOCK_DATA=true` in `dashboard/.env.local`
2. Start only the React dev server: `cd dashboard && npm run dev`
3. Authentication and API calls will use mock data

## Production Build

### Building the Frontend

```bash
cd dashboard
npm run build
```

This creates an optimized production build in the `dashboard/dist/` folder containing:
- Minified JavaScript and CSS files
- Optimized assets (images, icons)
- Production-ready HTML

### Preview Production Build

```bash
cd dashboard
npm run preview
```

Serves the production build locally at http://localhost:4173 for testing.

### Build Modes

- **Production build**: `npm run build` (default, optimized)
- **Development build**: `npm run build:dev` (faster, with source maps)

### Automated Build Script

Use the provided build script for convenience:

```bash
# Build everything (frontend + backend)
./build.sh

# Build only frontend
./build.sh frontend

# Build only backend  
./build.sh backend
```

The script creates a `build/` directory with all production artifacts.

## Deployment

### Frontend Deployment

The built frontend (`dashboard/dist/`) can be deployed on:

- **Static hosting**: Netlify, Vercel, GitHub Pages
- **Web server**: Nginx, Apache, IIS
- **CDN**: AWS CloudFront, Cloudflare

**Example Nginx configuration:**
```nginx
server {
    listen 80;
    root /path/to/dashboard/dist;
    index index.html;
    
    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy (optional)
    location /dashboard/ {
        proxy_pass http://localhost:8989;
    }
}
```

### Backend Deployment

Build the Go server for production:
```bash
cd server
go build -o lcp-server .
./lcp-server
```

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
