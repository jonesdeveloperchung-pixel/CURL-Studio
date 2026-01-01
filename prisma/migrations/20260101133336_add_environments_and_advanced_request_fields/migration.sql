-- AlterTable
ALTER TABLE "History" ADD COLUMN "headers" TEXT;
ALTER TABLE "History" ADD COLUMN "response" TEXT;

-- CreateTable
CREATE TABLE "Environment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EnvVariable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "environmentId" TEXT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EnvVariable_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EnvVariable" ("createdAt", "enabled", "id", "key", "value") SELECT "createdAt", "enabled", "id", "key", "value" FROM "EnvVariable";
DROP TABLE "EnvVariable";
ALTER TABLE "new_EnvVariable" RENAME TO "EnvVariable";
CREATE TABLE "new_Request" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT,
    "name" TEXT,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "headers" TEXT NOT NULL,
    "body" TEXT,
    "protocol" TEXT NOT NULL DEFAULT 'HTTP',
    "preRequestScript" TEXT,
    "postResponseScript" TEXT,
    "assertions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Request_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Request" ("body", "collectionId", "createdAt", "headers", "id", "method", "name", "url") SELECT "body", "collectionId", "createdAt", "headers", "id", "method", "name", "url" FROM "Request";
DROP TABLE "Request";
ALTER TABLE "new_Request" RENAME TO "Request";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
