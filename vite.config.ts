
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: '/' keeps asset paths absolute from the domain root (works on Vercel).
export default defineConfig({
  plugins: [react()],
  base: '/',
});
