import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

const stripCodeTags = (html: string): string => {
  if (!html) return html;
  return html
    .replace(/<pre[^>]*>/gi, "")
    .replace(/<\/pre>/gi, "")
    .replace(/<code[^>]*>/gi, "")
    .replace(/<\/code>/gi, "");
};

async function main() {
  const lines = await prisma.dialogueLine.findMany({
    select: { id: true, text: true },
  });

  const toUpdate = lines.filter((line) => /<pre|<code/i.test(line.text));

  if (toUpdate.length === 0) {
    console.log("Aucune ligne à nettoyer.");
    return;
  }

  console.log(`${toUpdate.length} ligne(s) à nettoyer...`);

  for (const line of toUpdate) {
    const cleaned = stripCodeTags(line.text);
    await prisma.dialogueLine.update({
      where: { id: line.id },
      data: { text: cleaned },
    });
    console.log(`  ✓ Ligne ${line.id} nettoyée`);
  }

  console.log("Nettoyage terminé.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
