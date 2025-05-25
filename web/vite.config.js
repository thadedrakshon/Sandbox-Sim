import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Sandbox-Sim/',
  root: './',
  publicDir: 'src/assets',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true
  }
});
