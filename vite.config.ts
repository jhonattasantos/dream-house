import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Served from https://jhonattasantos.github.io/dream-house/ on GitHub Pages.
export default defineConfig({
  base: '/dream-house/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
  },
});
