const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://evenzaaa_db_user:mfSvTqIyBifVaia1@evnza.98lh1bw.mongodb.net/?appName=Evnza';

async function checkUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected\n');
    
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    if (users.length === 0) {
      console.log('No users found in database!');
      console.log('Please register a new account at http://localhost:3000/register');
    } else {
      console.log(`Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.firstName} ${user.lastName}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Active: ${user.isActive}`);
        console.log(`  Has Password: ${!!user.password}`);
        console.log('');
      });
    }
    
    await mongoose.disconnect();
    console.log('✓ Done');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
