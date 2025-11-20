import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * Scheduled function that runs every day at 09:00 AM.
 * Checks for documents expiring within the next 30 days and sends notifications via FCM.
 * 
 * Deploy with: firebase deploy --only functions:checkDocumentExpiry
 */
export const checkDocumentExpiry = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('Africa/Johannesburg')
  .onRun(async (context) => {
    const db = admin.firestore();
    
    // Calculate date range (Today to 30 days from now)
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // Format as YYYY-MM-DD for string comparison
    // Note: Ensure Firestore stores dates as ISO strings (YYYY-MM-DD) or adjust to use Timestamp objects.
    const todayStr = now.toISOString().split('T')[0];
    const thirtyDaysStr = thirtyDaysFromNow.toISOString().split('T')[0];

    console.log(`[Expiry Check] Running check for period: ${todayStr} to ${thirtyDaysStr}`);

    try {
      // Query 'documents' collection for items expiring in the window
      // Schema: documents/{documentId} { ownerId: string, type: string, expiryDate: string, status: string }
      const snapshot = await db.collection('documents')
        .where('expiryDate', '>=', todayStr)
        .where('expiryDate', '<=', thirtyDaysStr)
        .where('status', '==', 'Verified') // Only alert for currently verified/active docs
        .get();

      if (snapshot.empty) {
        console.log('[Expiry Check] No documents found expiring in the next 30 days.');
        return null;
      }

      console.log(`[Expiry Check] Found ${snapshot.size} documents expiring soon.`);

      const notificationPromises: Promise<void>[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const { ownerId, type, expiryDate } = data;

        // Create a promise for each notification to run in parallel
        const sendNotification = async () => {
          try {
            // Get the user's FCM token
            const userDoc = await db.collection('users').doc(ownerId).get();
            const userData = userDoc.data();

            if (!userData || !userData.fcmToken) {
              console.log(`[Expiry Check] No FCM token found for user ${ownerId}`);
              return;
            }

            // Construct the FCM message
            const message: admin.messaging.Message = {
              notification: {
                title: '⚠️ Document Expiring Soon',
                body: `Your ${type} document is set to expire on ${expiryDate}. Please upload a renewal to avoid service interruption.`,
              },
              token: userData.fcmToken,
              data: {
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
                type: 'document_expiry',
                documentId: doc.id,
                expiryDate: expiryDate
              },
              android: {
                priority: 'high',
                notification: {
                  channelId: 'document_alerts'
                }
              },
              apns: {
                payload: {
                  aps: {
                    sound: 'default'
                  }
                }
              }
            };

            // Send the message
            await admin.messaging().send(message);
            console.log(`[Expiry Check] Notification sent to ${ownerId} for ${type}`);
          } catch (err) {
            console.error(`[Expiry Check] Failed to send notification to ${ownerId}:`, err);
          }
        };

        notificationPromises.push(sendNotification());
      });

      // Wait for all notifications to be sent
      await Promise.all(notificationPromises);
      console.log('[Expiry Check] All notifications processed.');

    } catch (error) {
      console.error('[Expiry Check] Fatal error:', error);
    }

    return null;
  });
