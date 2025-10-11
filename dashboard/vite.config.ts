import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Development configuration
// Set USE_MOCK_DATA to true to use static data instead of real API calls
// You can also set VITE_USE_MOCK_DATA=true in .env.local to override this
const USE_MOCK_DATA = process.env.VITE_USE_MOCK_DATA === 'true' || false; // Change to false to use real API

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8090,
    // Reduce browser caching for development
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    // Configuration proxy pour le développement (optionnel)
    // Proxy only API routes, not frontend routes
    proxy: {
      '/dashboard/login': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/dashboard/data': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/dashboard/overshared-licenses': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/dashboard/revoke': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Pass the mock data flag to the client
    __USE_MOCK_DATA__: USE_MOCK_DATA,
  },
  // Reduce caching in development
  optimizeDeps: {
    force: mode === 'development', // Force re-optimization in development
  },
  build: {
    // Disable build cache in development for HMR
    rollupOptions: mode === 'development' ? {
      output: {
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]'
      }
    } : {}
  },
}));
