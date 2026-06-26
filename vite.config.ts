import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawBase = process.env.BASE_PATH?.trim() ?? "";
const basePath = rawBase
  ? `/${rawBase.replace(/^\/+|\/+$/g, "")}`
  : "";

export default defineConfig({
  base: basePath ? `${basePath}/` : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3001,
  },
});
