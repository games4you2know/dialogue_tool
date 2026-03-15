-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
DROP TABLE IF EXISTS "new_dialogue_lines";
CREATE TABLE "new_dialogue_lines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dialogueId" TEXT NOT NULL,
    "characterId" TEXT,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "displayedCharacterId" TEXT,
    "leftCharacterId" TEXT,
    "rightCharacterId" TEXT,
    "displayedMoodId" TEXT,
    "leftMoodId" TEXT,
    "rightMoodId" TEXT,
    "leftCharacterActive" BOOLEAN NOT NULL DEFAULT false,
    "rightCharacterActive" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "dialogue_lines_dialogueId_fkey" FOREIGN KEY ("dialogueId") REFERENCES "dialogues" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dialogue_lines_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_dialogue_lines" ("id", "dialogueId", "characterId", "text", "order", "displayedCharacterId", "leftCharacterId", "rightCharacterId", "displayedMoodId", "leftMoodId", "rightMoodId", "leftCharacterActive", "rightCharacterActive") 
SELECT "id", "dialogueId", "characterId", COALESCE("text", ''), "order", "displayedCharacterId", "leftCharacterId", "rightCharacterId", "displayedMoodId", "leftMoodId", "rightMoodId", "leftCharacterActive", "rightCharacterActive" FROM "dialogue_lines";
DROP TABLE "dialogue_lines";
ALTER TABLE "new_dialogue_lines" RENAME TO "dialogue_lines";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
