const { db } = require('./backend/db/database');

console.log('Database migration completed successfully!');
console.log('New tables created:');
console.log('- documents: For storing uploaded document information');
console.log('- assessments: For storing credit assessment results');

// Close the database connection
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});