import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  optimizeDeps: {
    include: ['react', 'react-dom/client', 'lucide-react']
  },
  server: {
    // The Claude Code preview harness assigns a free port via PORT when
    // .claude/launch.json has "autoPort": true; without this, Vite's own
    // default (5173) ignores that assignment.
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    warmup: {
      clientFiles: ['./src/main.tsx']
    }
  },
  plugins: [react()]
});
