const fs = require('fs');
const path = require('path');

// Path to old database file
const dbPath = path.join(__dirname, '..', 'data', 'database.json');

// Migration function for file-based database
const migrateData = async () => {
  try {
    console.log('Starting data migration to file-based database...');
    
    // Read old database
    if (!fs.existsSync(dbPath)) {
      console.log('No existing database file found. Creating initial data structure.');
      
      // Create data directory if it doesn't exist
      const dataDir = path.join(__dirname, '..', 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // Create initial data files
      const initialFiles = {
        'users.json': [],
        'documents.json': [],
        'assessments.json': [],
        'transactions.json': [],
        'activity_logs.json': []
      };
      
      for (const [filename, data] of Object.entries(initialFiles)) {
        const filePath = path.join(dataDir, filename);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          console.log(`Created ${filename}`);
        }
      }
      
      console.log('Initial data structure created successfully!');
      process.exit(0);
    }
    
    // Read existing database
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Migrate users
    console.log(`Migrating ${data.users.length} users...`);
    const usersFilePath = path.join(dataDir, 'users.json');
    let usersData = [];
    
    if (fs.existsSync(usersFilePath)) {
      usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    }
    
    for (const user of data.users) {
      // Check if user already exists
      const existingUser = usersData.find(u => u.id === user.id);
      if (!existingUser) {
        // Add user to file-based database
        usersData.push({
          id: user.id,
          username: user.username,
          email: user.email,
          password: user.password, // Already hashed
          name: user.fullName || user.username,
          phone: user.phone || '',
          address: user.address || '',
          occupation: user.occupation || '',
          role: user.role,
          created_at: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
          creditScore: user.creditScore || null,
          assessed: user.assessed || false
        });
        console.log(`Migrated user: ${user.username}`);
      } else {
        console.log(`User ${user.username} already exists. Skipping.`);
      }
    }
    
    // Write users data to file
    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
    
    // Migrate documents
    console.log(`Migrating ${data.documents ? data.documents.length : 0} documents...`);
    const documentsFilePath = path.join(dataDir, 'documents.json');
    let documentsData = [];
    
    if (fs.existsSync(documentsFilePath)) {
      documentsData = JSON.parse(fs.readFileSync(documentsFilePath, 'utf8'));
    }
    
    if (data.documents) {
      for (const doc of data.documents) {
        // Check if document already exists
        const existingDoc = documentsData.find(d => d.id === doc.id);
        if (!existingDoc) {
          // Add document to file-based database
          documentsData.push({
            id: doc.id,
            user_id: doc.userId,
            [doc.type]: doc.path,
            uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString() : new Date().toISOString()
          });
          console.log(`Migrated document: ${doc.name}`);
        } else {
          console.log(`Document ${doc.name} already exists. Skipping.`);
        }
      }
    }
    
    // Write documents data to file
    fs.writeFileSync(documentsFilePath, JSON.stringify(documentsData, null, 2));
    
    // Migrate assessments
    console.log(`Migrating ${data.assessments ? data.assessments.length : 0} assessments...`);
    const assessmentsFilePath = path.join(dataDir, 'assessments.json');
    let assessmentsData = [];
    
    if (fs.existsSync(assessmentsFilePath)) {
      assessmentsData = JSON.parse(fs.readFileSync(assessmentsFilePath, 'utf8'));
    }
    
    if (data.assessments) {
      for (const assessment of data.assessments) {
        // Check if assessment already exists
        const existingAssessment = assessmentsData.find(a => a.id === assessment.id);
        if (!existingAssessment) {
          // Add assessment to file-based database
          assessmentsData.push({
            id: assessment.id,
            user_id: assessment.userId,
            score: assessment.score,
            risk_level: 'okay', // Default risk level
            reasons: assessment.reasons || {},
            created_at: assessment.createdAt ? new Date(assessment.createdAt).toISOString() : new Date().toISOString()
          });
          console.log(`Migrated assessment for user: ${assessment.userId}`);
        } else {
          console.log(`Assessment ${assessment.id} already exists. Skipping.`);
        }
      }
    }
    
    // Write assessments data to file
    fs.writeFileSync(assessmentsFilePath, JSON.stringify(assessmentsData, null, 2));
    
    // Create empty files for transactions and activity logs if they don't exist
    const transactionsFilePath = path.join(dataDir, 'transactions.json');
    if (!fs.existsSync(transactionsFilePath)) {
      fs.writeFileSync(transactionsFilePath, JSON.stringify([], null, 2));
      console.log('Created transactions.json');
    }
    
    const activityLogsFilePath = path.join(dataDir, 'activity_logs.json');
    if (!fs.existsSync(activityLogsFilePath)) {
      fs.writeFileSync(activityLogsFilePath, JSON.stringify([], null, 2));
      console.log('Created activity_logs.json');
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