import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import apiRouter from './routes/api';
import { dbSyncService } from './data/dbSync';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (temple photos, etc.)
app.use('/static', express.static(path.join(__dirname, '../public')));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Root & Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Om Devotional Mobile & Web Backend API',
    version: '1.0.0',
    documentation: '/api/v1',
    mongoConnected: dbSyncService.getIsConnected(),
    endpoints: {
      deities: '/api/v1/deities',
      videos: '/api/v1/videos',
      temples: '/api/v1/temples',
      auth: '/api/v1/auth',
      trustees: '/api/v1/trustees',
      notifications: '/api/v1/notifications',
      dbStatus: '/api/v1/db-status'
    }
  });
});

app.get('/health', async (req, res) => {
  const stats = await dbSyncService.getDatabaseStats();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: stats
  });
});

// Mount API routes
app.use('/api/v1', apiRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// MongoDB Connection & Automatic Data Sync
if (MONGODB_URI) {
  console.log('🕉️ Connecting to MongoDB Atlas cluster...');
  mongoose
    .connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    })
    .then(async () => {
      console.log('🕉️ Connected to MongoDB Atlas successfully!');
      dbSyncService.setConnected(true);
      await dbSyncService.initializeDatabase();
    })
    .catch(err => {
      console.warn('⚠️ MongoDB connection warning (falling back to in-memory store):', err.message);
      dbSyncService.setConnected(false);
    });
} else {
  console.log('🕉️ Running with verified in-memory devotional data store (No MONGODB_URI specified).');
}

// Start Server
app.listen(PORT, () => {
  console.log(`
======================================================
  🪔 OM DEVOTIONAL REST API SERVER IS RUNNING 🪔
======================================================
  • Port:        ${PORT}
  • URL:         http://localhost:${PORT}
  • API Base:    http://localhost:${PORT}/api/v1
  • DB Status:   http://localhost:${PORT}/api/v1/db-status
  • Health Check: http://localhost:${PORT}/health
======================================================
  `);
});

export default app;
