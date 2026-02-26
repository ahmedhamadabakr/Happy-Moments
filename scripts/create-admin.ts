import { connectDB } from '../lib/db';
import { User } from '../lib/models/User';
import { Company } from '../lib/models/Company';
import { hashPassword } from '../lib/auth/helpers';

async function createAdmin() {
  try {
    await connectDB();
    
    // Default admin credentials
    const adminData = {
      companyName: 'شركة تجريبية',
      companyEmail: 'company@test.com',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'admin123456', // Change this!
    };
    
    // Check if company exists
    let company = await Company.findOne({ email: adminData.companyEmail });
    
    if (!company) {
      company = new Company({
        name: adminData.companyName,
        email: adminData.companyEmail,
      });
      await company.save();
      console.log('✅ Company created');
    } else {
      console.log('ℹ️  Company already exists');
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email: adminData.email });
    
    if (existingUser) {
      console.log('❌ User already exists with this email');
      console.log(`   Email: ${existingUser.email}`);
      process.exit(1);
    }
    
    // Hash password
    const hashedPassword = await hashPassword(adminData.password);
    
    // Create admin user
    const user = new User({
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      email: adminData.email,
      password: hashedPassword,
      company: company._id,
      role: 'admin',
      isActive: true,
    });
    
    await user.save();
    
    console.log('\n✅ Admin user created successfully!\n');
    console.log('Login credentials:');
    console.log(`  Email: ${adminData.email}`);
    console.log(`  Password: ${adminData.password}`);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();
