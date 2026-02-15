import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_qhyL4Dec7Bju@ep-proud-dawn-a169ppl8.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
});

async function initDatabase() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test if tables exist
    const userCount = await prisma.user.count();
    console.log(`✅ User table exists. Current count: ${userCount}`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database error:', error);
    process.exit(1);
  }
}

initDatabase();
