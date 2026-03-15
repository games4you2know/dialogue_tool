-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_dialogue_lines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dialogueId" TEXT NOT NULL,
    "characterId" TEXT,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "conditions" TEXT,
    "actions" TEXT,
    "displayedCharacterId" TEXT,
    "leftCharacterId" TEXT,
    "rightCharacterId" TEXT,
    "displayedMoodId" TEXT,
    "leftMoodId" TEXT,
    "rightMoodId" TEXT,
    CONSTRAINT "dialogue_lines_dialogueId_fkey" FOREIGN KEY ("dialogueId") REFERENCES "dialogues" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dialogue_lines_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_dialogue_lines" ("actions", "characterId", "conditions", "dialogueId", "displayedCharacterId", "displayedMoodId", "id", "leftCharacterId", "leftMoodId", "order", "rightCharacterId", "rightMoodId", "text") SELECT "actions", "characterId", "conditions", "dialogueId", "displayedCharacterId", "displayedMoodId", "id", "leftCharacterId", "leftMoodId", "order", "rightCharacterId", "rightMoodId", "text" FROM "dialogue_lines";
DROP TABLE "dialogue_lines";
ALTER TABLE "new_dialogue_lines" RENAME TO "dialogue_lines";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
