import { Router } from "express";
import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// GET /api/backgrounds/:projectId - Récupérer tous les backgrounds d'un projet
router.get("/:projectId", async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }
    
    const backgrounds = await prisma.background.findMany({
      where: { projectId },
      orderBy: { name: "asc" }
    });
    res.json(backgrounds);
  } catch (error) {
    console.error("Error fetching backgrounds:", error);
    res.status(500).json({ error: "Failed to fetch backgrounds" });
  }
});

// GET /api/backgrounds/detail/:id - Récupérer un background par son ID
router.get("/detail/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "Background ID is required" });
    }
    
    const background = await prisma.background.findUnique({
      where: { id }
    });
    
    if (!background) {
      return res.status(404).json({ error: "Background not found" });
    }
    
    res.json(background);
  } catch (error) {
    console.error("Error fetching background:", error);
    res.status(500).json({ error: "Failed to fetch background" });
  }
});

// POST /api/backgrounds - Créer un nouveau background
router.post("/", async (req: Request, res: Response) => {
  try {
    const { projectId, name, imageUrl } = req.body;
    
    if (!projectId || !name || !imageUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const background = await prisma.background.create({
      data: {
        projectId,
        name,
        imageUrl
      }
    });
    
    res.status(201).json(background);
  } catch (error) {
    console.error("Error creating background:", error);
    res.status(500).json({ error: "Failed to create background" });
  }
});

// PUT /api/backgrounds/:id - Mettre à jour un background
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, imageUrl } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: "Background ID is required" });
    }
    
    const background = await prisma.background.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(imageUrl && { imageUrl })
      }
    });
    
    res.json(background);
  } catch (error) {
    console.error("Error updating background:", error);
    res.status(500).json({ error: "Failed to update background" });
  }
});

// DELETE /api/backgrounds/:id - Supprimer un background
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "Background ID is required" });
    }
    
    await prisma.background.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting background:", error);
    res.status(500).json({ error: "Failed to delete background" });
  }
});

export default router;
