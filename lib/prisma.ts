import { PrismaClient } from '../node_modules/.prisma-gen/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });

// Cache Prisma Client in global scope to prevent multiple instances
globalForPrisma.prisma = prisma;
