import Database from 'better-sqlite3';
import path from 'path';

let db = null;

export function getDatabase() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'cashround.db');
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Initialize tables
    initializeTables();
  }
  return db;
}

function initializeTables() {
  const db = getDatabase();
  
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT UNIQUE NOT NULL,
      username TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_member BOOLEAN DEFAULT FALSE,
      referral_count INTEGER DEFAULT 0,
      total_earnings REAL DEFAULT 0
    )
  `);

  // Pools table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT UNIQUE NOT NULL,
      creator_address TEXT NOT NULL,
      size INTEGER NOT NULL,
      contribution REAL NOT NULL,
      round_duration INTEGER NOT NULL,
      start_time INTEGER NOT NULL,
      current_round INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_address) REFERENCES users(address)
    )
  `);

  // Pool members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pool_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pool_address TEXT NOT NULL,
      member_address TEXT NOT NULL,
      payout_order INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pool_address) REFERENCES pools(address),
      FOREIGN KEY (member_address) REFERENCES users(address),
      UNIQUE(pool_address, member_address)
    )
  `);

  // Pool contributions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pool_contributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pool_address TEXT NOT NULL,
      member_address TEXT NOT NULL,
      round_number INTEGER NOT NULL,
      amount REAL NOT NULL,
      transaction_hash TEXT,
      contributed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pool_address) REFERENCES pools(address),
      FOREIGN KEY (member_address) REFERENCES users(address)
    )
  `);

  // Pool payouts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pool_payouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pool_address TEXT NOT NULL,
      recipient_address TEXT NOT NULL,
      round_number INTEGER NOT NULL,
      amount REAL NOT NULL,
      transaction_hash TEXT,
      paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pool_address) REFERENCES pools(address),
      FOREIGN KEY (recipient_address) REFERENCES users(address)
    )
  `);

  // Referrals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referrer_address TEXT NOT NULL,
      referred_address TEXT NOT NULL,
      level INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (referrer_address) REFERENCES users(address),
      FOREIGN KEY (referred_address) REFERENCES users(address),
      UNIQUE(referred_address)
    )
  `);

  // User activity table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_address TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_address) REFERENCES users(address)
    )
  `);

  // Pool analytics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pool_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pool_address TEXT NOT NULL,
      total_contributions REAL DEFAULT 0,
      total_payouts REAL DEFAULT 0,
      active_members INTEGER DEFAULT 0,
      completed_rounds INTEGER DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pool_address) REFERENCES pools(address)
    )
  `);

  console.log('Database tables initialized successfully');
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
