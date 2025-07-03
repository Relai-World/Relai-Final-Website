import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      // CORRECTED: Point to the 'public' folder inside 'backend'
      "@shared": path.resolve(import.meta.dirname, "..", "backend", "public"), 
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  // ADD THIS SECTION: It's required because your 'root' is set to 'client'
  server: {
    fs: {
      // Allow serving files from the project's real root directory (one level up)
      allow: [path.resolve(import.meta.dirname, "..")],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
});