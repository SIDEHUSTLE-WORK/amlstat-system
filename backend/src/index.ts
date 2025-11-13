// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import submissionRoutes from './routes/submissionRoutes';
import organizationRoutes from './routes/organizationRoutes';
import chatRoutes from './routes/chat.routes';
import prisma, { testConnection } from './config/prisma'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
app.use('/api/chat', chatRoutes);

// Health check route with database status
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection with Prisma
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ 
      success: true, 
      message: '🇺🇬 AML/CFT Statistics API is running!',
      database: 'Connected ✅',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'API running but database connection failed',
      database: 'Disconnected ❌',
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
const startServer = async () => {
  try {
    // Test Prisma database connection
    await testConnection();

    // Start listening
    app.listen(PORT, () => {
      console.log('🇺🇬 ================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`✅ API Health: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
      console.log(`🏢 Organizations: http://localhost:${PORT}/api/organizations`);
      console.log(`📊 Submissions: http://localhost:${PORT}/api/submissions`);
      console.log(`💬 Chat: http://localhost:${PORT}/api/chat`);
      console.log(`🗄️  Database: Prisma + PostgreSQL`);
      console.log('🇺🇬 ================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;