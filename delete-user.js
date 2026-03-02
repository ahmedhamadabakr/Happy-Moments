const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://evenzaaa_db_user:mfSvTqIyBifVaia1@evnza.98lh1bw.mongodb.net/?appName=Evnza';

async function deleteUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected');
    
    const email = 'ahmedhamadabakr77@gmail.com';
    
    // Delete user
    const userResult = await mongoose.connection.db.collection('users').deleteOne({ email });
    console.log(`Deleted ${userResult.deletedCount} user(s)`);
    
    // Delete company if needed
    const companyResult = await mongoose.connection.db.collection('companies').deleteMany({});
    console.log(`Deleted ${companyResult.deletedCount} company(ies)`);
    
    await mongoose.disconnect();
    console.log('✓ Done');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

deleteUser();
