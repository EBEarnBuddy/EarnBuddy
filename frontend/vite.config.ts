import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true, // listen on all network interfaces
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  preview: {
    host: true, // allow external hosts
    allowedHosts: ['earnbuddy-frontend.onrender.com'], // add your Render domain here
    port: Number(process.env.PORT) || 4173, // use Render port if set
  },
});
