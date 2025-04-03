import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@daily-co/daily-js', '@vapi-ai/web', 'events']
  },
  resolve: {
    dedupe: ['@daily-co/daily-js', '@vapi-ai/web', 'events', 'react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173
  }
});