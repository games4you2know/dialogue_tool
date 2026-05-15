/*
  Warnings:

  - You are about to drop the column `displayedCharacterId` on the `dialogue_lines` table. All the data in the column will be lost.
  - You are about to drop the column `displayedMoodId` on the `dialogue_lines` table. All the data in the column will be lost.
  - You are about to drop the column `leftCharacterActive` on the `dialogue_lines` table. All the data in the column will be lost.
  - You are about to drop the column `leftCharacterId` on the `dialogue_lines` table. All the data in the column will be lost.
  - You are about to drop the column `leftMoodId` on the `dialogue_lines` table. All the data in the column will be lost.
  - You are about to drop the column `rightCharacterActive` on the `dialogue_lines` table. All the data in the column will be lost.
  - You are about to drop the column `rightCharacterId` on the `dialogue_lines` table. All the data in the column will be lost.
  - You are about to drop the column `rightMoodId` on the `dialogue_lines` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_dialogue_lines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dialogueId" TEXT NOT NULL,
    "characterId" TEXT,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "secondaryCharacterId" TEXT,
    "mainCharacterMoodId" TEXT,
    "mainCharacterPosition" INTEGER NOT NULL DEFAULT 1,
    "secondaryCharacterMoodId" TEXT,
    "secondaryCharacterPosition" INTEGER NOT NULL DEFAULT 1,
    "triggerCameraShake" BOOLEAN NOT NULL DEFAULT false,
    "memory" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "dialogue_lines_dialogueId_fkey" FOREIGN KEY ("dialogueId") REFERENCES "dialogues" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dialogue_lines_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_dialogue_lines" (
    "characterId", "dialogueId", "id", "order", "text",
    "mainCharacterMoodId",
    "mainCharacterPosition",
    "secondaryCharacterId",
    "secondaryCharacterMoodId",
    "secondaryCharacterPosition"
)
SELECT
    "characterId", "dialogueId", "id", "order", "text",
    -- mainCharacterMoodId: use displayedMoodId for single-char mode, or the active side's mood for two-char mode
    CASE
        WHEN "leftCharacterId" IS NULL AND "rightCharacterId" IS NULL THEN "displayedMoodId"
        WHEN "leftCharacterActive" = 1 THEN "leftMoodId"
        WHEN "rightCharacterActive" = 1 THEN "rightMoodId"
        ELSE "displayedMoodId"
    END,
    -- mainCharacterPosition: middle for single-char, left(0) if leftActive, right(2) if rightActive
    CASE
        WHEN "leftCharacterId" IS NULL AND "rightCharacterId" IS NULL THEN 1
        WHEN "leftCharacterActive" = 1 THEN 0
        WHEN "rightCharacterActive" = 1 THEN 2
        ELSE 1
    END,
    -- secondaryCharacterId: the non-active side in two-char mode
    CASE
        WHEN "leftCharacterActive" = 1 THEN "rightCharacterId"
        WHEN "rightCharacterActive" = 1 THEN "leftCharacterId"
        ELSE NULL
    END,
    -- secondaryCharacterMoodId
    CASE
        WHEN "leftCharacterActive" = 1 THEN "rightMoodId"
        WHEN "rightCharacterActive" = 1 THEN "leftMoodId"
        ELSE NULL
    END,
    -- secondaryCharacterPosition: opposite side of main
    CASE
        WHEN "leftCharacterActive" = 1 THEN 2
        WHEN "rightCharacterActive" = 1 THEN 0
        ELSE 1
    END
FROM "dialogue_lines";
DROP TABLE "dialogue_lines";
ALTER TABLE "new_dialogue_lines" RENAME TO "dialogue_lines";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
