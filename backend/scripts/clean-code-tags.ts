import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { stripCodeTags } from "../src/utils/stripCodeTags.js";

dotenv.config();

const prisma = new PrismaClient();

const hasCodeTags = (value: string | null | undefined): boolean =>
  !!value && /<pre|<code/i.test(value);

async function cleanRecords<T extends { id: string }>(
  label: string,
  records: T[],
  getFields: (record: T) => Record<string, string | null | undefined>,
  update: (id: string, data: Record<string, string | null>) => Promise<unknown>
) {
  let count = 0;

  for (const record of records) {
    const fields = getFields(record);
    const data: Record<string, string | null> = {};

    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === "string" && hasCodeTags(value)) {
        data[key] = stripCodeTags(value);
      }
    }

    if (Object.keys(data).length === 0) continue;

    await update(record.id, data);
    count += 1;
    console.log(`  ✓ ${label} ${record.id}`);
  }

  console.log(`${label}: ${count} enregistrement(s) nettoyé(s).`);
}

async function main() {
  const [
    dialogueLines,
    dialogueChoices,
    dialogues,
    smsMessages,
    smsQuestions,
    smsAnswers,
    journalEntries,
    socialPosts,
  ] = await Promise.all([
    prisma.dialogueLine.findMany({ select: { id: true, text: true } }),
    prisma.dialogueChoice.findMany({ select: { id: true, text: true } }),
    prisma.dialogue.findMany({ select: { id: true, description: true } }),
    prisma.sMSMessage.findMany({ select: { id: true, text: true, shortContent: true } }),
    prisma.sMSQuestion.findMany({ select: { id: true, content: true } }),
    prisma.sMSAnswer.findMany({
      select: { id: true, content: true, shortContent: true, cpuResponse: true },
    }),
    prisma.journalEntry.findMany({
      select: { id: true, content: true, context: true, info: true },
    }),
    prisma.socialPost.findMany({ select: { id: true, content: true } }),
  ]);

  await cleanRecords(
    "dialogue_line",
    dialogueLines,
    (r) => ({ text: r.text }),
    (id, data) => prisma.dialogueLine.update({ where: { id }, data })
  );

  await cleanRecords(
    "dialogue_choice",
    dialogueChoices,
    (r) => ({ text: r.text }),
    (id, data) => prisma.dialogueChoice.update({ where: { id }, data })
  );

  await cleanRecords(
    "dialogue",
    dialogues,
    (r) => ({ description: r.description }),
    (id, data) => prisma.dialogue.update({ where: { id }, data })
  );

  await cleanRecords(
    "sms_message",
    smsMessages,
    (r) => ({ text: r.text, shortContent: r.shortContent }),
    (id, data) => prisma.sMSMessage.update({ where: { id }, data })
  );

  await cleanRecords(
    "sms_question",
    smsQuestions,
    (r) => ({ content: r.content }),
    (id, data) => prisma.sMSQuestion.update({ where: { id }, data })
  );

  await cleanRecords(
    "sms_answer",
    smsAnswers,
    (r) => ({
      content: r.content,
      shortContent: r.shortContent,
      cpuResponse: r.cpuResponse,
    }),
    (id, data) => prisma.sMSAnswer.update({ where: { id }, data })
  );

  await cleanRecords(
    "journal_entry",
    journalEntries,
    (r) => ({ content: r.content, context: r.context, info: r.info }),
    (id, data) => prisma.journalEntry.update({ where: { id }, data })
  );

  await cleanRecords(
    "social_post",
    socialPosts,
    (r) => ({ content: r.content }),
    (id, data) => prisma.socialPost.update({ where: { id }, data })
  );

  console.log("Nettoyage terminé.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
