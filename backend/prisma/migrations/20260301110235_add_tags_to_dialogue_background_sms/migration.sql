/*
  Warnings:

  - Added the required column `tag` to the `backgrounds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tag` to the `dialogues` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tag` to the `sms_conversations` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_backgrounds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    CONSTRAINT "backgrounds_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_backgrounds" ("id", "imageUrl", "name", "projectId", "tag") SELECT "id", "imageUrl", "name", "projectId", "name" FROM "backgrounds";
DROP TABLE "backgrounds";
ALTER TABLE "new_backgrounds" RENAME TO "backgrounds";
CREATE TABLE "new_dialogues" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "folderId" TEXT,
    "backgroundId" TEXT,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "description" TEXT,
    "isStartDialogue" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "dialogues_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dialogues_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "dialogues_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "backgrounds" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_dialogues" ("backgroundId", "createdAt", "description", "folderId", "id", "isStartDialogue", "name", "projectId", "tag", "tags", "updatedAt") SELECT "backgroundId", "createdAt", "description", "folderId", "id", "isStartDialogue", "name", "projectId", "name", "tags", "updatedAt" FROM "dialogues";
DROP TABLE "dialogues";
ALTER TABLE "new_dialogues" RENAME TO "dialogues";
CREATE TABLE "new_sms_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "folderId" TEXT,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "isGroupChat" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sms_conversations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sms_conversations_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_sms_conversations" ("createdAt", "folderId", "id", "isGroupChat", "name", "projectId", "tag", "updatedAt") SELECT "createdAt", "folderId", "id", "isGroupChat", "name", "projectId", "name", "updatedAt" FROM "sms_conversations";
DROP TABLE "sms_conversations";
ALTER TABLE "new_sms_conversations" RENAME TO "sms_conversations";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
