/*
  Warnings:

  - Added the required column `tag` to the `moods` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_moods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "moods_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_moods" ("createdAt", "id", "name", "projectId", "tag", "updatedAt") SELECT "createdAt", "id", "name", "projectId", "name", "updatedAt" FROM "moods";
DROP TABLE "moods";
ALTER TABLE "new_moods" RENAME TO "moods";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
