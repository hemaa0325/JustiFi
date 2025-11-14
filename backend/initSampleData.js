const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Generate unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const initSampleData = async () => {
  try {
    console.log('Initializing sample data...');
    
    // Ensure all required data files exist
    const requiredFiles = [
      'users.json',
      'documents.json',
      'assessments.json',
      'transactions.json',
      'activity_logs.json'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(dataDir, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
        console.log(`Created ${file}`);
      }
    }
    
    // Read existing users
    const usersFilePath = path.join(dataDir, 'users.json');
    let users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    
    // Create sample admin user
    const existingAdmin = users.find(u => u.email === 'admin@justifi.com');
    if (!existingAdmin) {
      const adminId = generateId();
      const adminPassword = await bcrypt.hash('admin123', 10);
      
      users.push({
        id: adminId,
        username: 'admin',
        email: 'admin@justifi.com',
        password: adminPassword,
        name: 'Admin User',
        phone: '',
        address: '',
        occupation: 'System Administrator',
        role: 'admin',
        created_at: new Date().toISOString(),
        creditScore: null,
        assessed: false
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
    
    // Create sample banker user
    const existingBanker = users.find(u => u.email === 'banker@justifi.com');
    if (!existingBanker) {
      const bankerId = generateId();
      const bankerPassword = await bcrypt.hash('banker123', 10);
      
      users.push({
        id: bankerId,
        username: 'banker',
        email: 'banker@justifi.com',
        password: bankerPassword,
        name: 'Banker User',
        phone: '',
        address: '',
        occupation: 'Loan Officer',
        role: 'banker',
        created_at: new Date().toISOString(),
        creditScore: null,
        assessed: false
      });
      console.log('Banker user created');
    } else {
      console.log('Banker user already exists');
    }
    
    // Create sample regular user
    const existingUser = users.find(u => u.email === 'user@justifi.com');
    if (!existingUser) {
      const userId = generateId();
      const userPassword = await bcrypt.hash('user123', 10);
      
      users.push({
        id: userId,
        username: 'user',
        email: 'user@justifi.com',
        password: userPassword,
        name: 'Sample User',
        phone: '',
        address: '',
        occupation: 'Software Engineer',
        role: 'user',
        created_at: new Date().toISOString(),
        creditScore: null,
        assessed: false
      });
      console.log('Sample user created');
    } else {
      console.log('Sample user already exists');
    }
    
    // Write updated users back to file
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    
    console.log('Sample data initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Sample data initialization failed:', error.message);
    process.exit(1);
  }
};

initSampleData();