import { getDatabase } from '../../../src/database/db';
import { syncService } from '../../../src/services/syncService';

export default function handler(req, res) {
  const db = getDatabase();

  switch (req.method) {
    case 'GET':
      return getAnalytics(req, res, db);
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getAnalytics(req, res, db) {
  try {
    const { type, address } = req.query;
    
    switch (type) {
      case 'user':
        if (!address) {
          return res.status(400).json({ error: 'Address is required for user analytics' });
        }
        const userAnalytics = await syncService.getUserAnalytics(address);
        return res.status(200).json(userAnalytics);
        
      case 'pool':
        if (!address) {
          return res.status(400).json({ error: 'Pool address is required for pool analytics' });
        }
        const poolAnalytics = await syncService.getPoolAnalytics(address);
        return res.status(200).json(poolAnalytics);
        
      case 'overview':
        // Get overall platform statistics
        const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
        const totalPools = db.prepare('SELECT COUNT(*) as count FROM pools').get();
        const activePools = db.prepare('SELECT COUNT(*) as count FROM pools WHERE status = "active"').get();
        const totalMembers = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_member = 1').get();
        
        // Get recent activity
        const recentActivity = db.prepare(`
          SELECT ua.*, u.username 
          FROM user_activity ua 
          LEFT JOIN users u ON ua.user_address = u.address 
          ORDER BY ua.created_at DESC 
          LIMIT 10
        `).all();
        
        // Get top pools by member count
        const topPools = db.prepare(`
          SELECT p.address, p.size, p.contribution, COUNT(pm.member_address) as member_count
          FROM pools p 
          LEFT JOIN pool_members pm ON p.address = pm.pool_address 
          GROUP BY p.address 
          ORDER BY member_count DESC 
          LIMIT 5
        `).all();
        
        return res.status(200).json({
          totalUsers: totalUsers.count,
          totalPools: totalPools.count,
          activePools: activePools.count,
          totalMembers: totalMembers.count,
          recentActivity,
          topPools
        });
        
      default:
        return res.status(400).json({ error: 'Invalid analytics type. Use: user, pool, or overview' });
    }
  } catch (error) {
    console.error('Error getting analytics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
