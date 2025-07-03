import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import type { CorsOptionsDelegate, CorsRequest } from 'cors';

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase } from "./db";
import { 
  createRateLimit, 
  validateUserAgent, 
  analyzeRequestPattern, 
  addRandomDelay, 
  validateRequest, 
  honeypot 
} from "./antiScraping";

// Fix for __dirname in ES modules with fallback
let __dirname: string;
try {
  const __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch (error) {
  console.warn('⚠️ Could not resolve __dirname, using process.cwd() as fallback');
  __dirname = process.cwd();
}

// Try to load .env file with multiple fallback locations
const possibleEnvPaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(process.cwd(), '../../.env')
];

let envLoaded = false;
for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('✅ Loaded env:', envPath);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('⚠️ No .env file found in any of the expected locations');
  console.warn('⚠️ Expected locations:', possibleEnvPaths);
  // Still try to load from environment variables
  dotenv.config();
}

const app = express();

// CORS middleware to allow cross-origin requests from any localhost port for development
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Redirect www.relai.world to relai.world
app.use((req, res, next) => {
  const host = req.get('host');
  if (host && host.startsWith('www.')) {
    const newHost = host.slice(4); // Remove 'www.'
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const redirectUrl = `${protocol}://${newHost}${req.originalUrl}`;
    return res.redirect(301, redirectUrl);
  }
  next();
});

// Anti-scraping middleware (apply before other middleware) - gentle protection
app.use(validateUserAgent); // Only blocks obvious scraping tools
app.use(createRateLimit(15 * 60 * 1000, 1000)); // 1000 requests per 15 minutes (very permissive)

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Initialize MongoDB connection
    console.log('🔄 Initializing MongoDB connection...');
    await initializeDatabase();
    console.log('✅ MongoDB connected successfully!');

    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5001
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5001;
    server.listen(5001, () => {
      console.log("🚀 Server is running on port 5001");
      console.log("📊 Database: MongoDB (Relai)");
      console.log("🌐 Environment:", app.get("env"));
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🔄 Shutting down server gracefully...');
      await closeDatabase();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🔄 Shutting down server gracefully...');
      await closeDatabase();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();

