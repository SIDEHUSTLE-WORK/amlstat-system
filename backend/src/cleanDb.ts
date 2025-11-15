import prisma from './config/prisma';

async function cleanDb() {
  try {
    console.log('🧹 Cleaning database...');
    
    await prisma.submission.deleteMany({});
    console.log('✅ Deleted all submissions');
    
    await prisma.user.deleteMany({
      where: {
        role: { not: 'FIA_ADMIN' }
      }
    });
    console.log('✅ Deleted all org users (kept admin)');
    
    await prisma.organization.deleteMany({});
    console.log('✅ Deleted all organizations');
    
    console.log('🎉 Database cleaned!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDb();
