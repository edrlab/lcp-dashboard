import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  const USE_MOCK_DATA = env.VITE_USE_MOCK_DATA === 'true' || false;
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8989';
  
  console.log('🔧 API Base URL:', apiBaseUrl);
  console.log('🔧 VITE_API_BASE_URL env var:', env.VITE_API_BASE_URL);
  console.log('🔧 USE_MOCK_DATA:', USE_MOCK_DATA);
  
  return {
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
    // Proxy only API routes when not using mock data
    proxy: USE_MOCK_DATA ? undefined : {
      '/dashdata': {
        target: apiBaseUrl,
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
  };
});
