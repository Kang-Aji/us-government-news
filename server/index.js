import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { fetchNewsArticles } from './newsService.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Enable CORS
app.use(cors());

// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../dist')));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Database setup
const dbPromise = open({
  filename: join(__dirname, 'database.sqlite'),
  driver: sqlite3.Database
});

async function initDb() {
  const db = await dbPromise;
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      department TEXT NOT NULL,
      officials TEXT NOT NULL,
      date TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      source TEXT
    );

    CREATE TABLE IF NOT EXISTS officials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL,
      mentions_count INTEGER DEFAULT 0
    );
  `);
}

// API endpoints
app.get('/api/articles', async (req, res) => {
  try {
    const articles = await fetchNewsArticles();
    res.json(articles);
  } catch (error) {
    console.error('Error in /api/articles:', error);
    res.status(500).json({ 
      error: 'Failed to fetch articles',
      message: error.message 
    });
  }
});

app.get('/api/trending', async (req, res) => {
  try {
    const db = await dbPromise;
    const officials = await db.all(
      'SELECT * FROM officials ORDER BY mentions_count DESC LIMIT 5'
    );
    res.json(officials);
  } catch (error) {
    console.error('Error in /api/trending:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trending officials',
      message: error.message 
    });
  }
});

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// Initialize database and start server
async function startServer() {
  try {
    await initDb();
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
    // Update articles every 5 minutes
    setInterval(async () => {
      try {
        await fetchNewsArticles();
      } catch (error) {
        console.error('Error updating articles:', error);
      }
    }, 300000);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();