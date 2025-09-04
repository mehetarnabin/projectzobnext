import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  server: {
    host: 'localhost',
    port: 3000,
  },
  css: {
    tailwind: './tailwind.config.js',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // <- This allows "@/lib/utils" to work
    },
  },
});
