-- CreateTable
CREATE TABLE "sms_stream_endpoints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "streamId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sms_stream_endpoints_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "sms_conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
