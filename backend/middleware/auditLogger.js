const { createAuditLog } = require('../db/mongoDatabase');
const jwt = require('jsonwebtoken');

// JWT secret (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'trusttap_secret_key';

// Middleware to log actions automatically
const auditLogger = (actionType) => {
  return async (req, res, next) => {
    try {
      // Extract user info from token
      const token = req.headers.authorization?.split(' ')[1];
      let userId = null;
      let role = 'anonymous';
      
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.userId;
          role = decoded.role;
        } catch (err) {
          // Token invalid, keep as anonymous
        }
      }
      
      // Capture request details
      const actionDetails = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        body: req.body,
        params: req.params,
        query: req.query
      };
      
      // For POST requests, we might want to capture the response data as well
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        // Store original send function
        const originalSend = res.send;
        
        // Override send to capture response
        res.send = function(data) {
          try {
            const responseData = JSON.parse(data);
            actionDetails.response = responseData;
          } catch (e) {
            // If it's not JSON, just store as string
            actionDetails.response = data;
          }
          
          // Call original send
          originalSend.call(this, data);
        };
      }
      
      // Create audit log entry
      await createAuditLog({
        userId,
        role,
        actionType,
        actionDetails
      });
      
    } catch (error) {
      console.error('Error in audit logging:', error);
      // Don't fail the request if audit logging fails
    }
    
    next();
  };
};

// Specialized middleware for specific actions
const documentUploadLogger = async (req, res, next) => {
  try {
    // This will be called after the document is uploaded
    // We'll add the document info to the request so it can be logged
    next();
  } catch (error) {
    console.error('Error in document upload logger:', error);
    next();
  }
};

const assessmentLogger = async (req, res, next) => {
  try {
    // This will be called after the assessment is created
    next();
  } catch (error) {
    console.error('Error in assessment logger:', error);
    next();
  }
};

module.exports = {
  auditLogger,
  documentUploadLogger,
  assessmentLogger
};