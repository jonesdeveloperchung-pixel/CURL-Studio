import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  
  // In Prisma 7, the adapter can be initialized with the URL directly or a better-sqlite3 instance
  // The error "TypeError: Cannot read properties of undefined (reading 'replace')" 
  // might suggest it expects an object with properties or it's misinterpreting the instance.
  
  // Let's try the object approach as suggested by recent docs
  const adapter = new PrismaBetterSqlite3({
    url: url
  });
  
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
