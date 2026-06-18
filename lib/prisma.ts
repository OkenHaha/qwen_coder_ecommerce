import { PrismaClient } from '@/app/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Prevent multiple instances in dev (Next.js hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // 1. Initialize the PostgreSQL driver adapter
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  })

  // 2. Pass the adapter to the PrismaClient constructor
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// That's it. Import { prisma } from '@/lib/prisma' anywhere.
// No browser client vs server client. Just one.
// Prisma only runs on the server (Server Components, Server Actions, Route Handlers).