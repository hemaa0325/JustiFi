const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

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

// Find user with password for authentication
const findUserWithPassword = (identifier) => {
  try {
    const users = readData('users.json');
    return users.find(u => u.username === identifier || u.email === identifier) || null;
  } catch (error) {
    throw error;
  }
};

// Verify password
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Test login
const testLogin = async (identifier, password) => {
  console.log(`Testing login for: ${identifier}`);
  
  // Find user
  const user = findUserWithPassword(identifier);
  if (!user) {
    console.log('User not found');
    return false;
  }
  
  console.log('User found:', user.username, user.email);
  
  // Verify password
  const isMatch = await verifyPassword(password, user.password);
  console.log('Password match:', isMatch);
  
  return isMatch;
};

// Test all users
const testAllUsers = async () => {
  const users = readData('users.json');
  
  for (const user of users) {
    console.log('\n--- Testing user:', user.username, '---');
    // We don't know the original passwords, so we'll just check if we can find the users
    const found = findUserWithPassword(user.username);
    console.log('Found by username:', !!found);
    
    if (user.email) {
      const foundByEmail = findUserWithPassword(user.email);
      console.log('Found by email:', !!foundByEmail);
    }
  }
};

testAllUsers().catch(console.error);