import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'database.sqlite');

export const dbPromise = open({
  filename: dbPath,
  driver: sqlite3.Database,
}).catch(err => {
  console.error('Failed to open database:', err);
  process.exit(1);
});

export async function initDb() {
  try {
    console.log('Initializing database...');
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
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}