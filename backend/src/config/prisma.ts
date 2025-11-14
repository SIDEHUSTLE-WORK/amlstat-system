// backend/src/config/prisma.ts
import { PrismaClient } from '@prisma/client';

// Create Prisma Client instance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

// Test connection
export const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connection established successfully (Prisma)');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    throw error;
  }
};

// Disconnect on shutdown
export const disconnect = async () => {
  await prisma.$disconnect();
  console.log('👋 Database connection closed');
};

// ❌ REMOVE THIS - IT'S CAUSING THE ISSUE!
// process.on('beforeExit', async () => {
//   await disconnect();
// });

export default prisma;