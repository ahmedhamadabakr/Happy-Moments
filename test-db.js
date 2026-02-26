const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://evenzaaa_db_user:mfSvTqIyBifVaia1@evnza.98lh1bw.mongodb.net/?appName=Evnza';

async function testConnection() {
  try {
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected successfully!');
    
    // Get user info
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\nUsers in database:');
    users.forEach(user => {
      console.log(`- Email: ${user.email}`);
      console.log(`  Name: ${user.firstName} ${user.lastName}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.isActive}`);
      console.log('');
    });
    
    await mongoose.disconnect();
    console.log('✓ Disconnected');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

testConnection();
