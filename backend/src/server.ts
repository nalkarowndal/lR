import { app } from './app.js';
import { config } from './config/env.js';
import { getDatabase } from './db/database.js';
import { seedDatabase } from './db/seed.js';

// 1. Initialize database & initial seeds
try {
  getDatabase();
  seedDatabase();
} catch (err) {
  console.error('[Database] Initialization error:', err);
  process.exit(1);
}

// 2. Start server
const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🚀 LuxuryRental API Server running!`);
  console.log(`📡 URL: http://localhost:${config.port}`);
  console.log(`🩺 Health: http://localhost:${config.port}/api/v1/health`);
  console.log(`🛠️  Environment: ${config.nodeEnv}`);
  console.log(`===============================================`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Closed.');
    process.exit(0);
  });
});
