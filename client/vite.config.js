import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server is proxied behind https://{port}-{sandbox}.e2b.app, so allow any host
// and route /api to the Express API running on :4000.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
    },
  },
  preview: { host: '0.0.0.0', port: 5173, allowedHosts: true },
});
