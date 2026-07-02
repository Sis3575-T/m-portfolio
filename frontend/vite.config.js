import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
    }),
  ],
  server: {
    port: 5173,
    allowedHosts: true,
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'ws',
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
