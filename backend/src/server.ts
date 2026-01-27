import app from './app';
import { env } from './config';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🏠 HostelVoice Backend Server                              ║
║                                                              ║
║   Environment: ${env.NODE_ENV.padEnd(44)}║
║   Port: ${PORT.toString().padEnd(52)}║
║   URL: http://localhost:${PORT.toString().padEnd(36)}║
║                                                              ║
║   Ready to accept connections...                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default server;
