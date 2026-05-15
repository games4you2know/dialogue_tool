import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// Get all calls for a project
router.get("/project/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId as string;
    const calls = await prisma.call.findMany({
      where: { projectId },
      include: {
        character: true
      },
      orderBy: { callDate: 'asc' }
    });
    res.json(calls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
});

// Get single call
router.get("/:callId", async (req, res) => {
  try {
    const callId = req.params.callId as string;
    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: {
        character: true
      }
    });
    if (!call) return res.status(404).json({ error: 'Call not found' });
    res.json(call);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch call' });
  }
});

// Create call
router.post("/", async (req, res) => {
  try {
    const { projectId, characterId, callDate, duration, status } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const call = await prisma.call.create({
      data: {
        projectId,
        characterId: characterId || null,
        callDate: callDate ? new Date(callDate) : new Date(),
        duration: duration !== undefined ? duration : 0,
        status: status !== undefined ? status : 0
      },
      include: {
        character: true
      }
    });
    res.status(201).json(call);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create call' });
  }
});

// Update call
router.put("/:callId", async (req, res) => {
  try {
    const callId = req.params.callId as string;
    const { characterId, callDate, duration, status } = req.body;

    const call = await prisma.call.update({
      where: { id: callId },
      data: {
        characterId: characterId !== undefined ? (characterId || null) : undefined,
        callDate: callDate ? new Date(callDate) : undefined,
        duration: duration !== undefined ? duration : undefined,
        status: status !== undefined ? status : undefined
      },
      include: {
        character: true
      }
    });
    res.json(call);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Call not found' });
    }
    res.status(500).json({ error: 'Failed to update call' });
  }
});

// Delete call
router.delete("/:callId", async (req, res) => {
  try {
    const callId = req.params.callId as string;
    await prisma.call.delete({
      where: { id: callId }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Call not found' });
    }
    res.status(500).json({ error: 'Failed to delete call' });
  }
});

export default router;
