import { getDatabase } from '../../../src/database/db';
import { syncService } from '../../../src/services/syncService';

export default function handler(req, res) {
  const db = getDatabase();

  switch (req.method) {
    case 'POST':
      return trackActivity(req, res, db);
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function trackActivity(req, res, db) {
  try {
    const { userAddress, activityType, details } = req.body;
    
    if (!userAddress || !activityType) {
      return res.status(400).json({ 
        error: 'userAddress and activityType are required' 
      });
    }

    // Track the activity
    const success = await syncService.trackActivity(userAddress, activityType, details);
    
    if (success) {
      return res.status(200).json({ message: 'Activity tracked successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to track activity' });
    }
  } catch (error) {
    console.error('Error tracking activity:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
