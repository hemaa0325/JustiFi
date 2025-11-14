const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Data directory
const dataDir = path.join(__dirname, 'data');

// Helper function to read data from a file
const readData = (filename) => {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write data to a file
const writeData = (filename, data) => {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Update passwords for admin and banker users
const updatePasswords = async () => {
  try {
    // Read existing users
    const users = readData('users.json');
    
    // Define new passwords
    const newPassword = 'justifi123'; // Default password for all test accounts
    
    // Update admin password
    const adminUser = users.find(user => user.username === 'admin');
    if (adminUser) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      adminUser.password = hashedPassword;
      console.log('Admin password updated successfully');
    } else {
      console.log('Admin user not found');
    }
    
    // Update banker password
    const bankerUser = users.find(user => user.username === 'banker');
    if (bankerUser) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      bankerUser.password = hashedPassword;
      console.log('Banker password updated successfully');
    } else {
      console.log('Banker user not found');
    }
    
    // Write updated users back to file
    writeData('users.json', users);
    
    console.log('Password update completed');
    console.log('New credentials:');
    console.log('- Admin: username "admin", password "justifi123"');
    console.log('- Banker: username "banker", password "justifi123"');
    
  } catch (error) {
    console.error('Error updating passwords:', error);
  }
};

// Run the function
updatePasswords();