import mongoose from 'mongoose';
import { CheckInLog } from '../lib/models/CheckInLog';

// IMPORTANT: Move this to an environment variable in a real application
const MONGODB_URI = 'mongodb+srv://evenzaaa_db_user:mfSvTqIyBifVaia1@evnza.98lh1bw.mongodb.net/?appName=Evnza';

async function cleanupCheckInLogs() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected
');

    const retentionDays = 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`Deleting check-in logs older than ${retentionDays} days (before ${cutoffDate.toISOString()})...`);

    const result = await CheckInLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    console.log(`✓ Success! Deleted ${result.deletedCount} old check-in log(s).`);

    await mongoose.disconnect();
    console.log('✓ Disconnected');
  } catch (error) {
    console.error('Error during check-in log cleanup:', error);
    process.exit(1);
  }
}

cleanupCheckInLogs();
