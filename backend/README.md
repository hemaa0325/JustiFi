# JustiFi Backend with File-based Database

This is the backend for the JustiFi application, using a file-based database for data storage and full activity logging.

## Features

1. **File-based Database**: Simple and lightweight file-based storage implementation
2. **Full Activity Logging**: Every action by users, bankers, and admins is logged with immutable records
3. **Role-Based Access Control**: Secure access control for different user roles
4. **RESTful API**: Clean, well-structured API endpoints
5. **Password Security**: bcrypt hashing for secure password storage

## Database Structure

The system uses JSON files to store data in the `data` directory:

### users.json
- `id` (String, unique identifier)
- `username` (String, unique)
- `email` (String, unique)
- `password` (String, hashed)
- `name` (String)
- `phone` (String)
- `address` (String)
- `occupation` (String)
- `role` (String: 'user', 'banker', 'admin')
- `created_at` (String, ISO timestamp)
- `creditScore` (Number or null)
- `assessed` (Boolean)

### documents.json
- `id` (String, unique identifier)
- `user_id` (String, reference to user)
- `salary_receipt` (String, file path)
- `bank_statement` (String, file path)
- `aadhar_card` (String, file path)
- `pan_card` (String, file path)
- `uploadedAt` (String, ISO timestamp)

### assessments.json
- `id` (String, unique identifier)
- `user_id` (String, reference to user)
- `score` (Number)
- `risk_level` (String: 'unsafe', 'okay', 'very safe')
- `reasons` (Object)
- `created_at` (String, ISO timestamp)

### transactions.json
- `id` (String, unique identifier)
- `user_id` (String, reference to user)
- `amount` (Number)
- `status` (String: 'pending', 'approved', 'disbursed', 'rejected')
- `created_at` (String, ISO timestamp)

### activity_logs.json
- `id` (String, unique identifier)
- `user_id` (String, reference to user)
- `role` (String: 'user', 'banker', 'admin')
- `action` (String)
- `old_value` (Object)
- `new_value` (Object)
- `timestamp` (String, ISO timestamp)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile/:userId` - Get user profile
- `PUT /api/auth/profile/:userId` - Update user profile
- `GET /api/auth/users` - Get all users (banker/admin only)

### Assessment
- `GET /api/assess/demo-users` - Get demo users
- `POST /api/assess/upload` - Upload document
- `POST /api/assess/user/:userId` - Run credit assessment
- `GET /api/assess/documents/:userId` - Get user documents

### Banker
- `GET /api/banker/users` - Get all users (banker/admin only)
- `GET /api/banker/documents/:userId` - Get user documents
- `POST /api/banker/assess/:userId` - Manual assessment
- `PUT /api/banker/documents/:documentId/status` - Update document status

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/activity-logs` - Get activity logs
- `GET /api/admin/activity-stats` - Get activity statistics

### Disbursement
- `GET /api/disburse/:userId` - Get user disbursements
- `PUT /api/disburse/:disbursementId/approve` - Approve disbursement
- `PUT /api/disburse/:disbursementId/disburse` - Disburse funds

## Activity Logging

Every action in the system is automatically logged with:
- User ID (if available)
- User role
- Action type
- Detailed action information
- Timestamp

Activity logs are immutable and provide a complete audit trail for compliance.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize the database:
   ```bash
   node initSampleData.js
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

## Data Migration

To migrate existing data from older formats:
```bash
npm run migrate
```

## Sample Data

To initialize the database with sample users:
```bash
node initSampleData.js
```

This will create:
- Admin user: admin@justifi.com / admin123
- Banker user: banker@justifi.com / banker123
- Regular user: user@justifi.com / user123

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control
- All sensitive data is properly protected
- Activity logs never contain plain passwords