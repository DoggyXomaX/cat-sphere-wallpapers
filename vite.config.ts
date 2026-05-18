import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'public'
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});