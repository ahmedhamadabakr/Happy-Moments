import { connectDB } from '../lib/db';
import { User } from '../lib/models/User';
import { Company } from '../lib/models/Company';

async function listUsers() {
  try {
    await connectDB();
    
    const users = await User.find().populate('company').select('+password');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('👉 Please register a new account at /register');
      process.exit(0);
    }
    
    console.log(`✅ Found ${users.length} user(s):\n`);
    
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.firstName} ${user.lastName}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Company: ${(user.company as any)?.name || 'N/A'}`);
      console.log(`  Active: ${user.isActive}`);
      console.log(`  Note: Password is hashed, cannot display\n`);
    });
    
    console.log('💡 To login, use the email above with your password');
    console.log('💡 If you forgot password, you need to reset it in database');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listUsers();
