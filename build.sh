#!/bin/bash

# Build script for LCP License Hub
# Usage: ./build.sh [frontend|backend|all]

set -e

BUILD_DIR="build"
FRONTEND_DIST="dashboard/dist"
BACKEND_BINARY="server/lcp-server"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

build_frontend() {
    print_status "Building frontend..."
    
    cd dashboard
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    # Build frontend
    npm run build
    
    cd ..
    
    print_status "Frontend built successfully in ${FRONTEND_DIST}/"
}

build_backend() {
    print_status "Building backend..."
    
    cd server
    
    # Tidy Go modules
    go mod tidy
    
    # Build backend
    go build -o lcp-server .
    
    cd ..
    
    print_status "Backend built successfully as ${BACKEND_BINARY}"
}

create_build_package() {
    print_status "Creating build package..."
    
    # Create build directory
    rm -rf $BUILD_DIR
    mkdir -p $BUILD_DIR
    
    # Copy frontend dist
    if [ -d "$FRONTEND_DIST" ]; then
        cp -r $FRONTEND_DIST $BUILD_DIR/frontend
        print_status "Frontend files copied to $BUILD_DIR/frontend/"
    fi
    
    # Copy backend binary
    if [ -f "$BACKEND_BINARY" ]; then
        cp $BACKEND_BINARY $BUILD_DIR/
        print_status "Backend binary copied to $BUILD_DIR/"
    fi
    
    # Copy configuration files
    if [ -f "dashboard/.env.example" ]; then
        cp dashboard/.env.example $BUILD_DIR/frontend.env.example
    fi
    
    print_status "Build package created in $BUILD_DIR/"
}

# Main script logic
case "${1:-all}" in
    frontend)
        build_frontend
        ;;
    backend)
        build_backend
        ;;
    all)
        build_frontend
        build_backend
        create_build_package
        ;;
    *)
        print_error "Usage: $0 [frontend|backend|all]"
        exit 1
        ;;
esac

print_status "Build completed successfully!"