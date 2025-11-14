const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Data directory
const dataDir = path.join(__dirname, 'backend', 'data');

// Helper function to read data from a file
const readData = (filename) => {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write data to a file
const writeData = (filename, data) => {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Reset passwords for all users
const resetPasswords = async () => {
  try {
    // Read existing users
    const users = readData('users.json');
    
    // Update passwords for all users
    for (const user of users) {
      let newPassword;
      
      switch (user.username) {
        case 'admin':
          newPassword = await bcrypt.hash('admin123', 10);
          break;
        case 'banker':
          newPassword = await bcrypt.hash('banker123', 10);
          break;
        case 'user':
          newPassword = await bcrypt.hash('user123', 10);
          break;
        default:
          // For other users, keep existing password
          newPassword = user.password;
      }
      
      user.password = newPassword;
    }
    
    // Write updated users back to file
    writeData('users.json', users);
    
    console.log('Passwords reset successfully!');
  } catch (error) {
    console.error('Error resetting passwords:', error.message);
  }
};

resetPasswords();