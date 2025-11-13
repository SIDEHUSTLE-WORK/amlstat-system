// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import submissionRoutes from './routes/submissionRoutes';
import organizationRoutes from './routes/organizationRoutes';
import chatRoutes from './routes/chat.routes'; 
import { sequelize, testConnection, syncDatabase } from './config/database';
import { User } from './models/User';
import { Organization } from './models/Organization';
import { Submission } from './models/Submission';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 Serve uploaded files (for chat attachments)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/chat', chatRoutes); // 🔥 ADD CHAT ROUTES

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '🇺🇬 AML/CFT Statistics API is running!',
    timestamp: new Date().toISOString()
  });
});

// 🔥 Define Model Associations
const setupAssociations = () => {
  // User belongs to Organization
  User.belongsTo(Organization, { 
    foreignKey: 'organizationId',
    as: 'organization' 
  });
  
  // Organization has many Users
  Organization.hasMany(User, { 
    foreignKey: 'organizationId',
    as: 'users'
  });

  // Submission belongs to Organization
  Submission.belongsTo(Organization, { 
    foreignKey: 'organizationId',
    as: 'organization'
  });
  
  // Organization has many Submissions
  Organization.hasMany(Submission, { 
    foreignKey: 'organizationId',
    as: 'submissions'
  });

  // Submission belongs to User (submitter)
  Submission.belongsTo(User, { 
    foreignKey: 'submittedBy', 
    as: 'submitter' 
  });
  
  // Submission belongs to User (reviewer)
  Submission.belongsTo(User, { 
    foreignKey: 'reviewedBy', 
    as: 'reviewer' 
  });

  console.log('✅ Model associations configured');
};

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Setup model associations
    setupAssociations();
    
    // Sync database
    await syncDatabase();

    // Start listening
    app.listen(PORT, () => {
      console.log('🇺🇬 ================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`✅ API Health: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
      console.log(`🏢 Organizations: http://localhost:${PORT}/api/organizations`);
      console.log(`📊 Submissions: http://localhost:${PORT}/api/submissions`);
      console.log(`💬 Chat: http://localhost:${PORT}/api/chat`); // 🔥 ADD THIS
      console.log('🇺🇬 ================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;