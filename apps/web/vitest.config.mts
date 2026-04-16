import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    watch: false,
    include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
    typecheck: {
      tsconfig: './tsconfig.spec.json',
    },
  },
});
