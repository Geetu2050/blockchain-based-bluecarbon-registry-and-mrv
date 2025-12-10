import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

class BadgeService {
  constructor() {
    this.collectionName = 'carbon_badges';
  }

  /**
   * Store a new carbon credit retirement badge in Firestore
   * @param {Object} badgeData - The badge data to store
   * @param {string} badgeData.userId - User ID
   * @param {string} badgeData.companyName - Company name
   * @param {string} badgeData.projectName - Project name
   * @param {number} badgeData.creditsRetired - Number of credits retired
   * @param {string} badgeData.transactionHash - Blockchain transaction hash
   * @param {string} badgeData.retirementDate - Date of retirement
   * @param {string} badgeData.badgeUrl - URL to the badge (if stored externally)
   * @returns {Promise<string>} Document ID of the stored badge
   */
  async createBadge(badgeData) {
    try {
      const badgeRecord = {
        ...badgeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        verified: true, // All blockchain transactions are considered verified
        status: 'active'
      };

      const docRef = await addDoc(collection(db, this.collectionName), badgeRecord);
      console.log('Badge created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating badge:', error);
      throw new Error('Failed to create badge record');
    }
  }

  /**
   * Get all badges for a specific user
   * @param {string} userId - User ID
   * @param {number} limitCount - Maximum number of badges to return
   * @returns {Promise<Array>} Array of badge records
   */
  async getUserBadges(userId, limitCount = 50) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const badges = [];
      
      querySnapshot.forEach((doc) => {
        badges.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return badges;
    } catch (error) {
      console.error('Error fetching user badges:', error);
      throw new Error('Failed to fetch user badges');
    }
  }

  /**
   * Get a specific badge by transaction hash
   * @param {string} transactionHash - Blockchain transaction hash
   * @returns {Promise<Object|null>} Badge record or null if not found
   */
  async getBadgeByTransactionHash(transactionHash) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('transactionHash', '==', transactionHash),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error fetching badge by transaction hash:', error);
      throw new Error('Failed to fetch badge');
    }
  }

  /**
   * Get all badges for a specific project
   * @param {string} projectName - Project name
   * @param {number} limitCount - Maximum number of badges to return
   * @returns {Promise<Array>} Array of badge records
   */
  async getProjectBadges(projectName, limitCount = 100) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('projectName', '==', projectName),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const badges = [];
      
      querySnapshot.forEach((doc) => {
        badges.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return badges;
    } catch (error) {
      console.error('Error fetching project badges:', error);
      throw new Error('Failed to fetch project badges');
    }
  }

  /**
   * Get statistics for a user's badge collection
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Statistics object
   */
  async getUserBadgeStats(userId) {
    try {
      const badges = await this.getUserBadges(userId, 1000); // Get more for accurate stats
      
      const stats = {
        totalBadges: badges.length,
        totalCreditsRetired: badges.reduce((sum, badge) => sum + (badge.creditsRetired || 0), 0),
        uniqueProjects: [...new Set(badges.map(badge => badge.projectName))].length,
        firstBadgeDate: badges.length > 0 ? badges[badges.length - 1].createdAt : null,
        latestBadgeDate: badges.length > 0 ? badges[0].createdAt : null
      };

      return stats;
    } catch (error) {
      console.error('Error calculating badge stats:', error);
      throw new Error('Failed to calculate badge statistics');
    }
  }

  /**
   * Verify a badge by checking if the transaction hash exists in our records
   * @param {string} transactionHash - Blockchain transaction hash
   * @returns {Promise<boolean>} True if badge is verified
   */
  async verifyBadge(transactionHash) {
    try {
      const badge = await this.getBadgeByTransactionHash(transactionHash);
      return badge !== null && badge.verified === true;
    } catch (error) {
      console.error('Error verifying badge:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const badgeService = new BadgeService();
export default badgeService;
