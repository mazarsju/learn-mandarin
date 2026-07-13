/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
  server: {
    proxy: {
      "/health": "http://127.0.0.1:5000",
      "/characters": "http://127.0.0.1:5000",
      "/words": "http://127.0.0.1:5000",
    },
  },
});
