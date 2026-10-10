import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Proxy API calls to the Express server in development
    proxy: {
      "/process": "http://localhost:5000",
      "/health": "http://localhost:5000",
    },
  },
  preview: {
    host: true,
  },
  build: {
    outDir: "dist",
  },
});
