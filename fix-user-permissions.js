const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://evenzaaa_db_user:mfSvTqIyBifVaia1@evnza.98lh1bw.mongodb.net/?appName=Evnza';

async function fixPermissions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected');
    
    // Update all users to remove permissions field validation
    const result = await mongoose.connection.db.collection('users').updateMany(
      {},
      { $unset: { permissions: "" } }
    );
    
    console.log(`Updated ${result.modifiedCount} user(s)`);
    
    // List users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\nUsers:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });
    
    await mongoose.disconnect();
    console.log('\n✓ Done');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixPermissions();
