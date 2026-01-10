# LCP Dashboard

A web application for managing LCP (Licensed Content Protection) licenses with a React frontend and Go mock backend.

## Project Structure

This project is organized into two main components:

### `/dashboard/` - React Frontend
- Modern React/TypeScript application
- Responsive dashboard with charts and statistics
- Authentication UI with protected routes
- Mock data mode for UI development

### `/test-server/` - Test Go Backend API
- RESTful API server built with Go and Chi router  
- JWT authentication system
- License management endpoints
- CORS support for frontend integration

## Quick Start
This will demonstrate how the dashboard works, using two terminals. 
The backend exposes static data to the frontend. 

### Backend (Go Server)
A recent Go environment is required.

```bash
cd test-server
go mod tidy
go run .
```

Note: go mod tidy will install the required dependencies and is required on the first execution only. 

The API server will be available at http://localhost:8989

### Frontend (React Dashboard) 
A recent npm / node.js environment is required. 

```bash  
cd dashboard
npm install
npm run dev
```

Note: npm install will install the required dependencies and is required on the first execution only. 

The dashboard will be available at http://localhost:8090

The test-server authorizes the user with name `admin` and password `supersecret`. 

## Development Workflow

### Frontend-Only Development
1. Set `VITE_USE_MOCK_DATA=true` in `dashboard/.env.local`
2. Start only the React dev server: `cd dashboard && npm run dev`
3. Authentication and API calls will use mock data

This mode is useful when working on the frontend using Cloud tooling, e.g. Lovable. 

### Client-Server Development
1. Start the Go server: `cd server && go run .`
2. Start the React dev server: `cd dashboard && npm run dev`
3. Access the dashboard at http://localhost:8090

This mode allows checking interactions between the frontend and the test backend. 

## Production Build, without Docker

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

## Production build, using Docker

The frontend can be built as a docker image. In this case, nginx is used as a reverse proxy during the creation of the image.

There are two build options:

- For testing the dashboard service with a local test-server, open `/dashboard/nginx.conf` and make sure  `dashdata` requests are passed to the test-server using:
```
    proxy_pass http://host.docker.internal:8989;
```

`host.docker.internal` specifies that the server is on the host machine. 

- For using the dashboard service in a multi-container app, open `/dashboard/nginx.conf` and make sure  `dashdata` requests are passed to the LCP Server service using:
```
    proxy_pass http://server:8989;
```

where `server` is the name of the LCP Server service in the multi-container app. 

## Deployment, without docker

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
    location /dashdata/ {
        proxy_pass http://localhost:8989;
    }
}
```

## Deployment using Docker

### Build and test lcp-dashboard locally
#### Build and tag the Docker image

> cd ~/work/lcp/lcp-dashboard

In nginx.conf, you should activate
proxy_pass http://host.docker.internal:8989;

In the ./dashboard directory (e.g. for an arm64 platform)
```
docker build --platform linux/arm64 -t myregistry/lcp-dashboard:latest-arm64 .
```

Where "myregistry" is the name of your Docker registry.

#### Launch the test data server
Launch the test server (on port 8989)
```bash
cd test-server
go run .
```

#### Launch the container
```
docker run -p 8090:8080 myregistry/lcp-dashboard:latest-arm64
```
You will then be able to access your application at http://localhost:8090.

Note: port 8090 is the one configured in the CORS headers of the test server (and the LCP v2 server), and it is the one used by the Vite test server of the dashboard. 

### Build and deploy lcp-dashboard

#### Build and tag the Docker image

> cd ~/work/lcp/lcp-dashboard

In nginx.conf, you should activate the service name of an LCP server container:
proxy_pass http://server:8989;

From the ./dashboard directory, enter (if your target is an amd64 system):
```
docker build --platform linux/amd64 -t myregistry/lcp-dashboard:latest-amd64 .
```

#### Push the image to Docker Hub
```
docker push myregistry/lcp-dashboard:latest-amd64
```

#### Modify compose-vm.yaml on the LCP Server

On the target system, compose.yaml must be modified to use the new dashboard image:

```yaml
services:
    dashboard:
        image: myregistry/lcp-dashboard:latest-amd64
        ports:
            - “8080:8080”
        depends_on:
            - server
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

## History
The LCP Server provides a monitoring API, but nobody ever proposed an open-source dashboard for it ... until now.

This started as an experiment of vide-coding with Lovable. The codebase was then enhanced using vscode with Gemini (mostly 2.5 Pro). 

The Test Server in Go is a minified version of the LCP Server V2, serving static data.  