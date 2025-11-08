import db, { initDatabase } from './db';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

// Delete the database file
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Database deleted successfully');
}

// Delete journal file if it exists
const journalPath = `${dbPath}-journal`;
if (fs.existsSync(journalPath)) {
  fs.unlinkSync(journalPath);
  console.log('Database journal deleted');
}

console.log('Database reset complete. Run "npm run seed" to create a fresh database.');
