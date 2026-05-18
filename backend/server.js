import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './src/routes/auth.js';
import usersRouter from './src/routes/users.js';
import eventsRouter from './src/routes/events.js';
import ticketsRouter from './src/routes/tickets.js';
import { errorHandler } from './src/middleware/auth.js';
import { validateEnv } from './src/utils/validateEnv.js';

dotenv.config();
validateEnv();

const app = express();
const DEFAULT_PORT = Number(process.env.PORT || 3000);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/tickets', ticketsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling middleware
app.use(errorHandler);

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy, trying ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    throw err;
  });

  return server;
};

// Start Server
startServer(DEFAULT_PORT);

export default app;
