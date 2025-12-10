import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Cloud Function triggered when a carbon credit retirement badge is created
 * This function can be used to:
 * 1. Send notifications
 * 2. Update analytics
 * 3. Trigger external API calls
 * 4. Generate additional verification data
 */
export const onBadgeCreated = functions.firestore
  .document('carbon_badges/{badgeId}')
  .onCreate(async (snap, context) => {
    const badgeData = snap.data();
    const badgeId = context.params.badgeId;

    console.log('New carbon credit badge created:', badgeId, badgeData);

    try {
      // Update user's total retirement count
      if (badgeData.userId) {
        await updateUserRetirementStats(badgeData.userId, badgeData.creditsRetired);
      }

      // Update project's total retirement count
      if (badgeData.projectName) {
        await updateProjectRetirementStats(badgeData.projectName, badgeData.creditsRetired);
      }

      // Log the retirement event for analytics
      await logRetirementEvent(badgeData);

      console.log('Badge processing completed successfully');
    } catch (error) {
      console.error('Error processing badge:', error);
      // Don't throw error to avoid retrying the function
    }
  });

/**
 * Update user's retirement statistics
 */
async function updateUserRetirementStats(userId: string, creditsRetired: number) {
  const userStatsRef = db.collection('user_stats').doc(userId);
  
  await db.runTransaction(async (transaction) => {
    const userStatsDoc = await transaction.get(userStatsRef);
    
    if (userStatsDoc.exists) {
      const currentStats = userStatsDoc.data();
      transaction.update(userStatsRef, {
        totalCreditsRetired: (currentStats?.totalCreditsRetired || 0) + creditsRetired,
        totalRetirementCount: (currentStats?.totalRetirementCount || 0) + 1,
        lastRetirementDate: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      transaction.set(userStatsRef, {
        userId,
        totalCreditsRetired: creditsRetired,
        totalRetirementCount: 1,
        firstRetirementDate: admin.firestore.FieldValue.serverTimestamp(),
        lastRetirementDate: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });
}

/**
 * Update project's retirement statistics
 */
async function updateProjectRetirementStats(projectName: string, creditsRetired: number) {
  const projectStatsRef = db.collection('project_stats').doc(projectName);
  
  await db.runTransaction(async (transaction) => {
    const projectStatsDoc = await transaction.get(projectStatsRef);
    
    if (projectStatsDoc.exists) {
      const currentStats = projectStatsDoc.data();
      transaction.update(projectStatsRef, {
        totalCreditsRetired: (currentStats?.totalCreditsRetired || 0) + creditsRetired,
        totalRetirementCount: (currentStats?.totalRetirementCount || 0) + 1,
        lastRetirementDate: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      transaction.set(projectStatsRef, {
        projectName,
        totalCreditsRetired: creditsRetired,
        totalRetirementCount: 1,
        firstRetirementDate: admin.firestore.FieldValue.serverTimestamp(),
        lastRetirementDate: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });
}

/**
 * Log retirement event for analytics
 */
async function logRetirementEvent(badgeData: any) {
  const analyticsRef = db.collection('retirement_analytics').doc();
  
  await analyticsRef.set({
    ...badgeData,
    eventType: 'credit_retirement',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate()
  });
}

/**
 * HTTP function to get retirement statistics
 */
export const getRetirementStats = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { userId, projectName, timeRange } = req.query;

    let query = db.collection('retirement_analytics');

    // Apply filters
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    if (projectName) {
      query = query.where('projectName', '==', projectName);
    }

    // Apply time range filter
    if (timeRange) {
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // All time
      }
      
      query = query.where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startDate));
    }

    const snapshot = await query.get();
    const retirements = snapshot.docs.map(doc => doc.data());

    // Calculate statistics
    const stats = {
      totalRetirements: retirements.length,
      totalCreditsRetired: retirements.reduce((sum, r) => sum + (r.creditsRetired || 0), 0),
      uniqueUsers: [...new Set(retirements.map(r => r.userId))].length,
      uniqueProjects: [...new Set(retirements.map(r => r.projectName))].length,
      averageCreditsPerRetirement: retirements.length > 0 
        ? retirements.reduce((sum, r) => sum + (r.creditsRetired || 0), 0) / retirements.length 
        : 0
    };

    res.status(200).json({
      success: true,
      data: stats,
      retirements: retirements.slice(0, 100) // Limit to 100 most recent
    });
  } catch (error) {
    console.error('Error fetching retirement stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch retirement statistics'
    });
  }
});

/**
 * HTTP function to verify a badge
 */
export const verifyBadge = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { transactionHash } = req.query;

    if (!transactionHash) {
      res.status(400).json({
        success: false,
        error: 'Transaction hash is required'
      });
      return;
    }

    const badgeQuery = await db.collection('carbon_badges')
      .where('transactionHash', '==', transactionHash)
      .limit(1)
      .get();

    if (badgeQuery.empty) {
      res.status(404).json({
        success: false,
        error: 'Badge not found'
      });
      return;
    }

    const badge = badgeQuery.docs[0].data();
    
    res.status(200).json({
      success: true,
      verified: true,
      badge: {
        id: badgeQuery.docs[0].id,
        ...badge
      }
    });
  } catch (error) {
    console.error('Error verifying badge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify badge'
    });
  }
});
