import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' permite abrir o build (dist/) em qualquer subpasta ou no GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: './',
});
