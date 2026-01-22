-- CreateTable
CREATE TABLE "sms_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "positiveReactions" TEXT NOT NULL,
    "negativeReactions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sms_questions_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "sms_messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sms_answers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "sms_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "sms_questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
