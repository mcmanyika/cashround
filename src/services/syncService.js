import { getDatabase } from '../database/db';
import { getWeb3, getFactory, getMukandoPool } from '../rosca/services/rosca';

export class SyncService {
  constructor() {
    this.db = getDatabase();
  }

  // Sync user data from blockchain
  async syncUser(address) {
    try {
      const web3 = await getWeb3();
      if (!web3) return false;

      // Check if user exists in database
      const existingUser = this.db.prepare('SELECT * FROM users WHERE address = ?').get(address);
      
      if (!existingUser) {
        // Create new user
        const stmt = this.db.prepare(`
          INSERT INTO users (address, is_member) 
          VALUES (?, ?)
        `);
        stmt.run(address, false);
      }

      // Update membership status
      const { isTreeMember } = await import('../rosca/services/rosca');
      const isMember = await isTreeMember(web3, address);
      
      const updateStmt = this.db.prepare(`
        UPDATE users 
        SET is_member = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE address = ?
      `);
      updateStmt.run(isMember ? 1 : 0, address);

      return true;
    } catch (error) {
      console.error('Error syncing user:', error);
      return false;
    }
  }

  // Sync pool data from blockchain
  async syncPool(poolAddress) {
    try {
      const web3 = await getWeb3();
      if (!web3) return false;

      const pool = getMukandoPool(web3, poolAddress);
      
      // Get pool info
      const poolInfo = await pool.methods.poolInfo().call();
      const payoutOrder = await pool.methods.getPayoutOrder().call();
      
      // Check if pool exists in database
      const existingPool = this.db.prepare('SELECT * FROM pools WHERE address = ?').get(poolAddress);
      
      if (!existingPool) {
        // Create new pool
        const stmt = this.db.prepare(`
          INSERT INTO pools (address, creator_address, size, contribution, round_duration, start_time, current_round) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          poolAddress,
          poolInfo.creator || '0x0000000000000000000000000000000000000000',
          poolInfo.size,
          web3.utils.fromWei(poolInfo.contribution, 'ether'),
          poolInfo.roundDuration,
          poolInfo.startTime,
          poolInfo.currentRound
        );
      } else {
        // Update existing pool
        const updateStmt = this.db.prepare(`
          UPDATE pools 
          SET current_round = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE address = ?
        `);
        updateStmt.run(poolInfo.currentRound, poolAddress);
      }

      // Sync pool members
      await this.syncPoolMembers(poolAddress, payoutOrder);

      return true;
    } catch (error) {
      console.error('Error syncing pool:', error);
      return false;
    }
  }

  // Sync pool members
  async syncPoolMembers(poolAddress, payoutOrder) {
    try {
      // Clear existing members
      this.db.prepare('DELETE FROM pool_members WHERE pool_address = ?').run(poolAddress);
      
      // Add new members
      const stmt = this.db.prepare(`
        INSERT INTO pool_members (pool_address, member_address, payout_order) 
        VALUES (?, ?, ?)
      `);
      
      payoutOrder.forEach((memberAddress, index) => {
        stmt.run(poolAddress, memberAddress, index);
      });

      return true;
    } catch (error) {
      console.error('Error syncing pool members:', error);
      return false;
    }
  }

  // Sync all pools from factory
  async syncAllPools() {
    try {
      const web3 = await getWeb3();
      if (!web3) return false;

      const factoryAddress = process.env.NEXT_PUBLIC_POOL_FACTORY_ADDRESS;
      if (!factoryAddress) return false;

      const factory = getFactory(web3, factoryAddress);
      const poolAddresses = await factory.methods.getPools().call();
      
      // Sync each pool
      for (const poolAddress of poolAddresses) {
        await this.syncPool(poolAddress);
      }

      return true;
    } catch (error) {
      console.error('Error syncing all pools:', error);
      return false;
    }
  }

  // Track user activity
  async trackActivity(userAddress, activityType, details = null) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO user_activity (user_address, activity_type, details) 
        VALUES (?, ?, ?)
      `);
      stmt.run(userAddress, activityType, details);
      return true;
    } catch (error) {
      console.error('Error tracking activity:', error);
      return false;
    }
  }

  // Get user analytics
  async getUserAnalytics(address) {
    try {
      const user = this.db.prepare('SELECT * FROM users WHERE address = ?').get(address);
      if (!user) return null;

      const activityCount = this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM user_activity 
        WHERE user_address = ?
      `).get(address);

      const poolsCreated = this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM pools 
        WHERE creator_address = ?
      `).get(address);

      const poolsJoined = this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM pool_members 
        WHERE member_address = ?
      `).get(address);

      return {
        user,
        activityCount: activityCount.count,
        poolsCreated: poolsCreated.count,
        poolsJoined: poolsJoined.count
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return null;
    }
  }

  // Get pool analytics
  async getPoolAnalytics(poolAddress) {
    try {
      const pool = this.db.prepare('SELECT * FROM pools WHERE address = ?').get(poolAddress);
      if (!pool) return null;

      const memberCount = this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM pool_members 
        WHERE pool_address = ?
      `).get(poolAddress);

      const contributionCount = this.db.prepare(`
        SELECT COUNT(*) as count, SUM(amount) as total 
        FROM pool_contributions 
        WHERE pool_address = ?
      `).get(poolAddress);

      const payoutCount = this.db.prepare(`
        SELECT COUNT(*) as count, SUM(amount) as total 
        FROM pool_payouts 
        WHERE pool_address = ?
      `).get(poolAddress);

      return {
        pool,
        memberCount: memberCount.count,
        totalContributions: contributionCount.total || 0,
        contributionCount: contributionCount.count,
        totalPayouts: payoutCount.total || 0,
        payoutCount: payoutCount.count
      };
    } catch (error) {
      console.error('Error getting pool analytics:', error);
      return null;
    }
  }
}

export const syncService = new SyncService();
