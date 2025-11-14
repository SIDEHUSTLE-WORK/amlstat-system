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

    // Start listening - proper TypeScript way
    const server = app.listen(Number(PORT), '0.0.0.0', () => {
      console.log('🇺🇬 ================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ API Health: /api/health`);
      console.log(`🔐 Login: POST /api/auth/login`);
      console.log(`🏢 Organizations: /api/organizations`);
      console.log(`📊 Submissions: /api/submissions`);
      console.log(`💬 Chat: /api/chat`);
      console.log(`🗄️  Database: Prisma + PostgreSQL`);
      console.log('🇺🇬 ================================');
    });

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};