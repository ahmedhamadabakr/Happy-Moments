import mongoose from 'mongoose';
import { ActivityLog } from '../lib/models/ActivityLog';

// IMPORTANT: Move this to an environment variable in a real application
const MONGODB_URI = 'mongodb+srv://evenzaaa_db_user:mfSvTqIyBifVaia1@evnza.98lh1bw.mongodb.net/?appName=Evnza';

async function cleanupActivityLogs() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected
');

    const retentionDays = 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`Deleting activity logs older than ${retentionDays} days (before ${cutoffDate.toISOString()})...`);

    const result = await ActivityLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    console.log(`✓ Success! Deleted ${result.deletedCount} old activity log(s).`);

    await mongoose.disconnect();
    console.log('✓ Disconnected');
  } catch (error) {
    console.error('Error during activity log cleanup:', error);
    process.exit(1);
  }
}

cleanupActivityLogs();
