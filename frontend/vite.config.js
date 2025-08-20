import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
    proxy: mode === 'development' ? {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('Proxy error:', err);
          });
        }
      },
      // For Google OAuth
      '/auth/google': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    } : undefined,
  },
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(mode),
      VITE_BACKEND_URL: JSON.stringify(
        mode === 'development' 
          ? 'http://localhost:5000' 
          : 'https://virtual-herbal-garden-cdah.onrender.com'
      )
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
    exclude: ['crypto'],
  },
  build: {
    target: 'esnext',
    sourcemap: mode === 'development',
  },
  resolve: {
    alias: {
      // Add any path aliases here if needed
    },
  },
  css: {
    devSourcemap: mode === 'development',
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
    strictPort: true,
  }
}));
