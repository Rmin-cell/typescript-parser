import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: ".",
  server: {
    port: 5173,
  },
  esbuild: {
    jsx: "automatic",
  },
  // Configure multiple entry points
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      input: {
        main: "index.html",
        terminal: "terminal.html",
        landing: "landing.html"
      }
    }
  }
});
