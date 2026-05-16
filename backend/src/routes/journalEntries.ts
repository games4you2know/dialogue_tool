import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// Get all journal entries for a project
router.get("/project/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId as string;
    const entries = await prisma.journalEntry.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// Get single journal entry
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id as string;
    const entry = await prisma.journalEntry.findUnique({
      where: { id }
    });
    if (!entry) return res.status(404).json({ error: 'Journal entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entry' });
  }
});

// Create journal entry
router.post("/", async (req, res) => {
  try {
    const { projectId, entryId, context, emotion, content, info } = req.body;

    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });
    if (!entryId) return res.status(400).json({ error: 'Entry ID is required' });
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const entry = await prisma.journalEntry.create({
      data: {
        projectId,
        entryId,
        context: context || '',
        emotion: emotion !== undefined ? emotion : 1,
        content,
        info: info || '',
      }
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

// Update journal entry
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id as string;
    const { entryId, context, emotion, content, info } = req.body;

    const entry = await prisma.journalEntry.update({
      where: { id },
      data: {
        ...(entryId !== undefined && { entryId }),
        ...(context !== undefined && { context }),
        ...(emotion !== undefined && { emotion }),
        ...(content !== undefined && { content }),
        ...(info !== undefined && { info }),
      }
    });
    res.json(entry);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

// Delete journal entry
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id as string;
    await prisma.journalEntry.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

export default router;
