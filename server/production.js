import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import { fetchNewsArticles } from './newsService.js';
import { fetchCongressionalActivity } from './congressService.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
}));

// Enable compression
app.use(compression());

// Enable CORS with specific origin in production
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Trust first proxy for Heroku
app.set('trust proxy', 1);

// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../dist')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/api/articles', async (req, res) => {
  try {
    const articles = await fetchNewsArticles();
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: error.message });
  }
});

// Congressional Activity endpoint
app.get('/api/congressional-activity', async (req, res) => {
  try {
    const activities = await fetchCongressionalActivity();
    res.json(activities);
  } catch (error) {
    console.error('Error fetching congressional activity:', error);
    res.status(500).json({ error: 'Failed to fetch congressional activity' });
  }
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// Create HTTP server
const httpServer = createServer(app);

// Set up Socket.IO with production configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  // Configure for Heroku's WebSocket requirements
  transports: ['websocket', 'polling'],
  path: '/socket.io/'
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
