import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import dotenv from 'dotenv';


export default defineConfig(({ mode }) => {
  // Manually load the right .env file
  dotenv.config({ path: path.resolve(__dirname, `.env.${mode}`) });

  const API_URL = process.env.VITE_API_URL || 'http://localhost:5001';
  const PORT = parseInt(process.env.VITE_PORT || '5001');

  console.log(`Using API URL: ${API_URL}`);
  
  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      themePlugin(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "DittoWebClone", "frontend", "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "DittoWebClone", "frontend", "client"),
    server: {
      host: '0.0.0.0',
      port: PORT,
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
    },
  };
});

