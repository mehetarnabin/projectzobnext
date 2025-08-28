// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // base: '/zobnext/frontend/', // <- Add this line
  server: {
    // host: '10.120.30.250',
    host: 'localhost',
    port: 3000,
  },
  css: {
    tailwind: './tailwind.config.js',
  },
  plugins: [react()],
});
