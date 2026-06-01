
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Setting base to './' ensures that all asset paths (JS, CSS, Images) 
// are relative, allowing the app to be hosted in any subfolder.
export default defineConfig({
  plugins: [react()],
  base: '/',
});
