import mongoose from 'mongoose';
import { WhatsAppMessage } from '../lib/models/WhatsAppMessage';

// IMPORTANT: Move this to an environment variable in a real application
const MONGODB_URI = 'mongodb+srv://evenzaaa_db_user:mfSvTqIyBifVaia1@evnza.98lh1bw.mongodb.net/?appName=Evnza';

async function cleanupWhatsAppMessages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected
');

    const retentionDays = 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`Deleting WhatsApp messages older than ${retentionDays} days (before ${cutoffDate.toISOString()})...`);

    const result = await WhatsAppMessage.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    console.log(`✓ Success! Deleted ${result.deletedCount} old WhatsApp message(s).`);

    await mongoose.disconnect();
    console.log('✓ Disconnected');
  } catch (error) {
    console.error('Error during WhatsApp message cleanup:', error);
    process.exit(1);
  }
}

cleanupWhatsAppMessages();
