import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

// https://vite.js.dev/config/
export default defineConfig({
  root: fs.realpathSync('.'),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(fs.realpathSync('.'), './src'),
    },
  },
  server: {
    watch: {
      ignored: ['**/*.md', '**/.git/**', '**/.agents/**', '**/.gemini/**', '**/.user_uploaded/**', '**/android/**'],
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['@phosphor-icons/react', 'lucide-react'],
        },
      },
    },
  },
});
