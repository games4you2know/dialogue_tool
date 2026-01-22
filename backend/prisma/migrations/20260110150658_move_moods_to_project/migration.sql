/*
  Warnings:

  - You are about to drop the column `characterId` on the `moods` table. All the data in the column will be lost.
  - Added the required column `projectId` to the `moods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `moods` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_moods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "moods_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_moods" ("id", "name", "projectId", "createdAt", "updatedAt") 
SELECT m.id, m.name, c.projectId, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP 
FROM "moods" m
INNER JOIN "characters" c ON c.id = m.characterId;
DROP TABLE "moods";
ALTER TABLE "new_moods" RENAME TO "moods";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
