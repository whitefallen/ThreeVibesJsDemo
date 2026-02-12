import { defineConfig } from 'vite';

export default defineConfig({
  base: '/ThreeVibesJsDemo/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
});
