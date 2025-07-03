import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { resolvePath } from "./server/utils/path-utils";

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
      "@": resolvePath(import.meta.url, "client", "src"),
      "@shared": resolvePath(import.meta.url, "shared"),
      "@assets": resolvePath(import.meta.url, "attached_assets"),
    },
  },
  root: resolvePath(import.meta.url, "client"),
  build: {
    outDir: resolvePath(import.meta.url, "public"),
    emptyOutDir: true,
  },
}); 