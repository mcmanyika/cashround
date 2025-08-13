import { getDatabase } from '../../../src/database/db';

export default function handler(req, res) {
  const db = getDatabase();

  switch (req.method) {
    case 'GET':
      return getPools(req, res, db);
    case 'POST':
      return createPool(req, res, db);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getPools(req, res, db) {
  try {
    const { address, creator } = req.query;
    
    if (address) {
      // Get specific pool
      const stmt = db.prepare(`
        SELECT p.*, u.username as creator_username 
        FROM pools p 
        LEFT JOIN users u ON p.creator_address = u.address 
        WHERE p.address = ?
      `);
      const pool = stmt.get(address);
      
      if (!pool) {
        return res.status(404).json({ error: 'Pool not found' });
      }
      
      return res.status(200).json(pool);
    } else if (creator) {
      // Get pools by creator
      const stmt = db.prepare(`
        SELECT p.*, u.username as creator_username 
        FROM pools p 
        LEFT JOIN users u ON p.creator_address = u.address 
        WHERE p.creator_address = ?
        ORDER BY p.created_at DESC
      `);
      const pools = stmt.all(creator);
      
      return res.status(200).json(pools);
    } else {
      // Get all pools with creator info
      const stmt = db.prepare(`
        SELECT p.*, u.username as creator_username 
        FROM pools p 
        LEFT JOIN users u ON p.creator_address = u.address 
        ORDER BY p.created_at DESC
      `);
      const pools = stmt.all();
      
      return res.status(200).json(pools);
    }
  } catch (error) {
    console.error('Error getting pools:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createPool(req, res, db) {
  try {
    const { 
      address, 
      creator_address, 
      size, 
      contribution, 
      round_duration, 
      start_time 
    } = req.body;
    
    if (!address || !creator_address || !size || !contribution || !round_duration || !start_time) {
      return res.status(400).json({ 
        error: 'All pool fields are required: address, creator_address, size, contribution, round_duration, start_time' 
      });
    }
    
    // Check if pool already exists
    const existingStmt = db.prepare('SELECT id FROM pools WHERE address = ?');
    const existing = existingStmt.get(address);
    
    if (existing) {
      return res.status(409).json({ error: 'Pool already exists' });
    }
    
    // Create new pool
    const stmt = db.prepare(`
      INSERT INTO pools (address, creator_address, size, contribution, round_duration, start_time) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(address, creator_address, size, contribution, round_duration, start_time);
    
    // Get the created pool
    const getPoolStmt = db.prepare(`
      SELECT p.*, u.username as creator_username 
      FROM pools p 
      LEFT JOIN users u ON p.creator_address = u.address 
      WHERE p.id = ?
    `);
    const pool = getPoolStmt.get(result.lastInsertRowid);
    
    return res.status(201).json(pool);
  } catch (error) {
    console.error('Error creating pool:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
