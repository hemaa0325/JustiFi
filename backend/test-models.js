const mongoose = require('mongoose');
const User = require('./models/User');
const Document = require('./models/Document');
const Assessment = require('./models/Assessment');
const AuditLog = require('./models/AuditLog');

// Test MongoDB models
const testModels = async () => {
  try {
    // Connect to MongoDB test database
    await mongoose.connect('mongodb://localhost:27017/justifi_test', {
      // Remove deprecated options
    });
    
    console.log('Connected to MongoDB test database');
    
    // Test User model
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword123',
      fullName: 'Test User',
      role: 'user'
    });
    
    const savedUser = await testUser.save();
    console.log('✓ User model works correctly');
    console.log('Created user:', savedUser.username);
    
    // Test Document model
    const testDocument = new Document({
      userId: savedUser._id,
      type: 'salary_receipt',
      fileReference: '/path/to/file.pdf'
    });
    
    const savedDocument = await testDocument.save();
    console.log('✓ Document model works correctly');
    console.log('Created document:', savedDocument.type);
    
    // Test Assessment model
    const testAssessment = new Assessment({
      userId: savedUser._id,
      score: 85,
      safetyLevel: 'very safe',
      explanation: { factor: 'income_stability', points: 20 }
    });
    
    const savedAssessment = await testAssessment.save();
    console.log('✓ Assessment model works correctly');
    console.log('Created assessment with score:', savedAssessment.score);
    
    // Test AuditLog model
    const testAuditLog = new AuditLog({
      userId: savedUser._id,
      role: 'user',
      actionType: 'LOGIN',
      actionDetails: { message: 'User logged in' }
    });
    
    const savedAuditLog = await testAuditLog.save();
    console.log('✓ AuditLog model works correctly');
    console.log('Created audit log:', savedAuditLog.actionType);
    
    // Clean up test data
    await User.deleteOne({ _id: savedUser._id });
    await Document.deleteOne({ _id: savedDocument._id });
    await Assessment.deleteOne({ _id: savedAssessment._id });
    await AuditLog.deleteOne({ _id: savedAuditLog._id });
    
    console.log('✓ Test data cleaned up');
    
    // Close connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB test database');
    
    console.log('\n🎉 All models tested successfully!');
  } catch (error) {
    console.error('Error testing models:', error.message);
    console.log('\nNote: This test requires MongoDB to be running locally.');
    console.log('Please ensure MongoDB is installed and running before running this test.');
    
    // Close connection if it was opened
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
};

// Run the test
testModels();