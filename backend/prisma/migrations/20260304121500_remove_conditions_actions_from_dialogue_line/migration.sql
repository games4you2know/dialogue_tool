-- AlterTable
PRAGMA foreign_keys=OFF;

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
    CONSTRAINT "dialogue_lines_dialogueId_fkey" FOREIGN KEY ("dialogueId") REFERENCES "dialogues" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dialogue_lines_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_dialogue_lines" ("id", "dialogueId", "characterId", "text", "order", "displayedCharacterId", "leftCharacterId", "rightCharacterId", "displayedMoodId", "leftMoodId", "rightMoodId")
SELECT "id", "dialogueId", "characterId", "text", "order", "displayedCharacterId", "leftCharacterId", "rightCharacterId", "displayedMoodId", "leftMoodId", "rightMoodId" FROM "dialogue_lines";

DROP TABLE "dialogue_lines";
ALTER TABLE "new_dialogue_lines" RENAME TO "dialogue_lines";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
