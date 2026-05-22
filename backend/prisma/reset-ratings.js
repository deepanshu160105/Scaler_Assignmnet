import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const result = await prisma.product.updateMany({
  data: { rating: 0, reviewCount: 0 }
});
console.log(`Reset ${result.count} products to rating=0, reviewCount=0`);
await prisma.$disconnect();
