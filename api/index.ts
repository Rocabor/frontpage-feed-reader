import { app } from '../server';

// Vercel Serverless Function that hosts the Express API routes (/api/*).
// The static frontend build (dist/) is served by Vercel's Vite hosting, and
// /api/* paths are rewritten to this function via vercel.json.
export default app;
