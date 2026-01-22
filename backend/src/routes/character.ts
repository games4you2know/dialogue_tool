import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

// Get all characters for a project
router.get("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const characters = await prisma.character.findMany({
      where: { projectId },
      orderBy: { name: 'asc' }
    });
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// Get single character
router.get("/:characterId", async (req, res) => {
  try {
    const { characterId } = req.params;
    const character = await prisma.character.findUnique({
      where: { id: characterId }
    });
    if (!character) return res.status(404).json({ error: "Character not found" });
    res.json(character);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

// Create character
router.post("/", async (req, res) => {
  try {
    const { projectId, name, tag, color } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Character name is required' });
    }
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    const character = await prisma.character.create({
      data: {
        projectId,
        name: name.trim(),
        tag: tag.trim(),
        color: color?.trim() || null,
      }
    });
    
    res.status(201).json(character);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create character' });
  }
});

// Update character
router.put("/:characterId", async (req, res) => {
  try {
    const { characterId } = req.params;
    const { name, tag, color } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Character name is required' });
    }

    const character = await prisma.character.update({
      where: { id: characterId },
      data: {
        name: name.trim(),
        tag: tag.trim(),
        color: color?.trim() || null,
      }
    });
    
    res.json(character);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Character not found' });
    }
    res.status(500).json({ error: 'Failed to update character' });
  }
});

// Delete character
router.delete("/:characterId", async (req, res) => {
  try {
    const { characterId } = req.params;
    await prisma.character.delete({
      where: { id: characterId }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Character not found' });
    }
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

export default router;