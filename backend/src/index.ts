// backend/src/index.ts
import express, { Request, Response } from 'express';
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
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/chat', chatRoutes);

// Health check route
app.get('/api/health', async (req: Request, res: Response) => {
  try {
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
    console.log('🔄 Connecting to database...');
    
    // Test Prisma database connection
    await testConnection();

    console.log('✅ Starting Express server...');

    // Start listening
    const port = Number(PORT);
    
    app.listen(port, '0.0.0.0', () => {
      console.log('🇺🇬 ================================');
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ API Health: http://localhost:${port}/api/health`);
      console.log(`🔐 Login: POST http://localhost:${port}/api/auth/login`);
      console.log(`🏢 Organizations: http://localhost:${port}/api/organizations`);
      console.log(`📊 Submissions: http://localhost:${port}/api/submissions`);
      console.log(`💬 Chat: http://localhost:${port}/api/chat`);
      console.log(`🗄️  Database: Prisma + PostgreSQL`);
      console.log('🇺🇬 ================================');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown - ONLY IN index.ts
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await prisma.$disconnect();
  console.log('👋 Database connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await prisma.$disconnect();
  console.log('👋 Database connection closed');
  process.exit(0);
});

startServer();

export default app;