-- AlterTable
ALTER TABLE "sms_answers" ADD COLUMN "cpuResponse" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sms_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "folderId" TEXT,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "npcCharacterId" TEXT,
    "isGroupChat" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sms_conversations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sms_conversations_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "sms_conversations_npcCharacterId_fkey" FOREIGN KEY ("npcCharacterId") REFERENCES "characters" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_sms_conversations" ("createdAt", "folderId", "id", "isGroupChat", "name", "projectId", "tag", "updatedAt") SELECT "createdAt", "folderId", "id", "isGroupChat", "name", "projectId", "tag", "updatedAt" FROM "sms_conversations";
DROP TABLE "sms_conversations";
ALTER TABLE "new_sms_conversations" RENAME TO "sms_conversations";
CREATE TABLE "new_sms_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "characterId" TEXT,
    "fromCpu" BOOLEAN NOT NULL DEFAULT false,
    "text" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "attachmentUrl" TEXT,
    CONSTRAINT "sms_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "sms_conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sms_messages_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_sms_messages" ("attachmentUrl", "characterId", "conversationId", "id", "isRead", "messageType", "text", "timestamp") SELECT "attachmentUrl", "characterId", "conversationId", "id", "isRead", "messageType", "text", "timestamp" FROM "sms_messages";
DROP TABLE "sms_messages";
ALTER TABLE "new_sms_messages" RENAME TO "sms_messages";
CREATE TABLE "new_sms_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "positiveReactions" TEXT,
    "negativeReactions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sms_questions_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "sms_messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_sms_questions" ("content", "createdAt", "id", "messageId", "negativeReactions", "positiveReactions") SELECT "content", "createdAt", "id", "messageId", "negativeReactions", "positiveReactions" FROM "sms_questions";
DROP TABLE "sms_questions";
ALTER TABLE "new_sms_questions" RENAME TO "sms_questions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
