-- Rename contentExtended to shortContent on sms_messages
ALTER TABLE "sms_messages" RENAME COLUMN "contentExtended" TO "shortContent";
