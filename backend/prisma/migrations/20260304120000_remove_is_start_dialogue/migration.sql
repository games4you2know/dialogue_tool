-- AlterTable
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_dialogues" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "folderId" TEXT,
    "backgroundId" TEXT,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "dialogues_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dialogues_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "dialogues_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "backgrounds" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_dialogues" ("id", "projectId", "folderId", "backgroundId", "name", "tag", "description", "tags", "createdAt", "updatedAt")
SELECT "id", "projectId", "folderId", "backgroundId", "name", "tag", "description", "tags", "createdAt", "updatedAt" FROM "dialogues";

DROP TABLE "dialogues";
ALTER TABLE "new_dialogues" RENAME TO "dialogues";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
