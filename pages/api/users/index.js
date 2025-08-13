import { getDatabase } from '../../../src/database/db';

export default function handler(req, res) {
  const db = getDatabase();

  switch (req.method) {
    case 'GET':
      return getUsers(req, res, db);
    case 'POST':
      return createUser(req, res, db);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getUsers(req, res, db) {
  try {
    const { address } = req.query;
    
    if (address) {
      // Get specific user
      const stmt = db.prepare('SELECT * FROM users WHERE address = ?');
      const user = stmt.get(address);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json(user);
    } else {
      // Get all users
      const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
      const users = stmt.all();
      
      return res.status(200).json(users);
    }
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createUser(req, res, db) {
  try {
    const { address, username, email } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    // Check if user already exists
    const existingStmt = db.prepare('SELECT id FROM users WHERE address = ?');
    const existing = existingStmt.get(address);
    
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Create new user
    const stmt = db.prepare(`
      INSERT INTO users (address, username, email) 
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(address, username || null, email || null);
    
    // Get the created user
    const getUserStmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = getUserStmt.get(result.lastInsertRowid);
    
    return res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
