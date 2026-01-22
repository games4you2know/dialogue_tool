-- AlterTable
ALTER TABLE "dialogue_lines" ADD COLUMN "displayedCharacterId" TEXT;
ALTER TABLE "dialogue_lines" ADD COLUMN "leftCharacterId" TEXT;
ALTER TABLE "dialogue_lines" ADD COLUMN "rightCharacterId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_dialogues" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "folderId" TEXT,
    "backgroundId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isStartDialogue" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "dialogues_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dialogues_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "dialogues_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "backgrounds" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_dialogues" ("createdAt", "description", "folderId", "id", "isStartDialogue", "name", "projectId", "tags", "updatedAt") SELECT "createdAt", "description", "folderId", "id", "isStartDialogue", "name", "projectId", "tags", "updatedAt" FROM "dialogues";
DROP TABLE "dialogues";
ALTER TABLE "new_dialogues" RENAME TO "dialogues";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
