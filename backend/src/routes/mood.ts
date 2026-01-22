import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Get all moods for a project
router.get("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const moods = await prisma.mood.findMany({
      where: { projectId: String(projectId) },
      orderBy: { name: 'asc' }
    });
    res.json(moods);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch moods' });
  }
});

// Get a specific mood
router.get("/:moodId", async (req, res) => {
  try {
    const { moodId } = req.params;
    const mood = await prisma.mood.findUnique({
      where: { id: moodId }
    });
    
    if (!mood) {
      return res.status(404).json({ error: 'Mood not found' });
    }
    
    res.json(mood);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mood' });
  }
});

// Create a mood for a project
router.post("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Mood name is required' });
    }
    
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const mood = await prisma.mood.create({
      data: {
        name: name.trim(),
        projectId
      }
    });
    
    res.status(201).json(mood);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mood' });
  }
});

// Update a mood
router.put("/:moodId", async (req, res) => {
  try {
    const { moodId } = req.params;
    const { name } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Mood name is required' });
    }
    
    const mood = await prisma.mood.update({
      where: { id: moodId },
      data: { name: name.trim() }
    });
    
    res.json(mood);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Mood not found' });
    }
    res.status(500).json({ error: 'Failed to update mood' });
  }
});

// Delete a mood
router.delete("/:moodId", async (req, res) => {
  try {
    const { moodId } = req.params;
    
    await prisma.mood.delete({
      where: { id: moodId }
    });
    
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Mood not found' });
    }
    res.status(500).json({ error: 'Failed to delete mood' });
  }
});

export default router;
