const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Document = require('../models/Document');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/justifi';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Path to old database file
const dbPath = path.join(__dirname, '..', 'data', 'database.json');

// Migration function
const migrateData = async () => {
  try {
    console.log('Starting data migration...');
    
    // Read old database
    if (!fs.existsSync(dbPath)) {
      console.log('No existing database file found. Skipping migration.');
      process.exit(0);
    }
    
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Migrate users
    console.log(`Migrating ${data.users.length} users...`);
    for (const user of data.users) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
          $or: [{ username: user.username }, { email: user.email }] 
        });
        
        if (!existingUser) {
          const newUser = new User({
            _id: new mongoose.Types.ObjectId(user.id),
            username: user.username,
            email: user.email,
            password: user.password, // Already hashed
            fullName: user.fullName || '',
            phone: user.phone || '',
            address: user.address || '',
            occupation: user.occupation || '',
            role: user.role,
            createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
            updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date()
          });
          
          await newUser.save();
          console.log(`Migrated user: ${user.username}`);
        } else {
          console.log(`User ${user.username} already exists. Skipping.`);
        }
      } catch (error) {
        console.error(`Error migrating user ${user.username}:`, error.message);
      }
    }
    
    // Migrate documents
    console.log(`Migrating ${data.documents.length} documents...`);
    for (const doc of data.documents) {
      try {
        // Check if document already exists
        const existingDoc = await Document.findOne({ 
          userId: doc.userId,
          fileReference: doc.path
        });
        
        if (!existingDoc) {
          const newDocument = new Document({
            userId: doc.userId,
            type: doc.type,
            fileReference: doc.path,
            createdAt: doc.uploadedAt ? new Date(doc.uploadedAt) : new Date(),
            updatedAt: new Date()
          });
          
          await newDocument.save();
          console.log(`Migrated document: ${doc.name}`);
        } else {
          console.log(`Document ${doc.name} already exists. Skipping.`);
        }
      } catch (error) {
        console.error(`Error migrating document ${doc.name}:`, error.message);
      }
    }
    
    console.log('Data migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

// Run migration
migrateData();