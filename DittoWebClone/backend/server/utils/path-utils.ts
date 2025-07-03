import { fileURLToPath } from 'url';
import path from 'path';

// Utility function to get the directory name that works with esbuild
export function getDirname(importMetaUrl: string): string {
  try {
    const __filename = fileURLToPath(importMetaUrl);
    return path.dirname(__filename);
  } catch (error) {
    // Fallback for when import.meta.url is not available
    console.warn('import.meta.url not available, using process.cwd() as fallback');
    return process.cwd();
  }
}

// Utility function to resolve paths relative to the current file
export function resolvePath(importMetaUrl: string, ...paths: string[]): string {
  const dirname = getDirname(importMetaUrl);
  return path.resolve(dirname, ...paths);
} 