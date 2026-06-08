-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sms_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "folderId" TEXT,
    "npcCharacterId" TEXT,
    "isGroupChat" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sms_conversations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sms_conversations_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "sms_conversations_npcCharacterId_fkey" FOREIGN KEY ("npcCharacterId") REFERENCES "characters" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_sms_conversations" ("createdAt", "folderId", "id", "isGroupChat", "npcCharacterId", "projectId", "updatedAt") SELECT "createdAt", "folderId", "id", "isGroupChat", "npcCharacterId", "projectId", "updatedAt" FROM "sms_conversations";
DROP TABLE "sms_conversations";
ALTER TABLE "new_sms_conversations" RENAME TO "sms_conversations";
CREATE TABLE "new_sms_stream_endpoints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sms_stream_endpoints_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "sms_conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_sms_stream_endpoints" ("conversationId", "id", "timestamp") SELECT "conversationId", "id", "timestamp" FROM "sms_stream_endpoints";
DROP TABLE "sms_stream_endpoints";
ALTER TABLE "new_sms_stream_endpoints" RENAME TO "sms_stream_endpoints";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
