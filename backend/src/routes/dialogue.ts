import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

// Get all dialogues for a project
router.get("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const dialogues = await prisma.dialogue.findMany({
      where: { projectId },
      include: {
        background: true,
        characters: {
          include: {
            character: true
          }
        },
        lines: {
          include: {
            character: true,
            choices: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(dialogues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dialogues' });
  }
});

// Get single dialogue
router.get("/:dialogueId", async (req, res) => {
  try {
    const { dialogueId } = req.params;
    const dialogue = await prisma.dialogue.findUnique({
      where: { id: dialogueId },
      include: {
        background: true,
        characters: {
          include: {
            character: true
          }
        },
        lines: {
          include: {
            character: true,
            choices: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });
    if (!dialogue) return res.status(404).json({ error: "Dialogue not found" });
    res.json(dialogue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dialogue' });
  }
});

// Create dialogue
router.post("/", async (req, res) => {
  try {
    const { projectId, name, description, isStartDialogue, folderId, backgroundId } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Dialogue name is required' });
    }
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    const dialogue = await prisma.dialogue.create({
      data: {
        projectId,
        name: name.trim(),
        description: description?.trim() || null,
        isStartDialogue: isStartDialogue || false,
        folderId: folderId || null,
        backgroundId: backgroundId || null
      },
      include: {
        background: true,
        characters: {
          include: {
            character: true
          }
        },
        lines: {
          include: {
            character: true,
            choices: true
          }
        }
      }
    });
    
    res.status(201).json(dialogue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create dialogue' });
  }
});

// Update dialogue
router.put("/:dialogueId", async (req, res) => {
  try {
    const { dialogueId } = req.params;
    const { name, description, isStartDialogue, folderId, backgroundId } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Dialogue name is required' });
    }

    const dialogue = await prisma.dialogue.update({
      where: { id: dialogueId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isStartDialogue: isStartDialogue || false,
        folderId: folderId || null,
        backgroundId: backgroundId || null
      },
      include: {
        background: true,
        characters: {
          include: {
            character: true
          }
        },
        lines: {
          include: {
            character: true,
            choices: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });
    
    res.json(dialogue);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Dialogue not found' });
    }
    res.status(500).json({ error: 'Failed to update dialogue' });
  }
});

// Delete dialogue
router.delete("/:dialogueId", async (req, res) => {
  try {
    const { dialogueId } = req.params;
    await prisma.dialogue.delete({
      where: { id: dialogueId }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Dialogue not found' });
    }
    res.status(500).json({ error: 'Failed to delete dialogue' });
  }
});

// Add dialogue line
router.post("/:dialogueId/lines", async (req, res) => {
  try {
    const { dialogueId } = req.params;
    const { characterId, text, order, displayedCharacterId, leftCharacterId, rightCharacterId, displayedMoodId, leftMoodId, rightMoodId } = req.body;
    
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Line text is required' });
    }

    const line = await prisma.dialogueLine.create({
      data: {
        dialogueId,
        characterId: characterId || null,
        text: text.trim(),
        order: order || 0,
        displayedCharacterId: displayedCharacterId || null,
        leftCharacterId: leftCharacterId || null,
        rightCharacterId: rightCharacterId || null,
        displayedMoodId: displayedMoodId || null,
        leftMoodId: leftMoodId || null,
        rightMoodId: rightMoodId || null
      },
      include: {
        character: true,
        choices: true
      }
    });
    
    res.status(201).json(line);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create dialogue line' });
  }
});

// Update dialogue line
router.put("/lines/:lineId", async (req, res) => {
  try {
    const { lineId } = req.params;
    const { characterId, text, order, displayedCharacterId, leftCharacterId, rightCharacterId, displayedMoodId, leftMoodId, rightMoodId } = req.body;
    
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Line text is required' });
    }

    const line = await prisma.dialogueLine.update({
      where: { id: lineId },
      data: {
        characterId: characterId || null,
        text: text.trim(),
        order: order,
        displayedCharacterId: displayedCharacterId !== undefined ? displayedCharacterId : undefined,
        leftCharacterId: leftCharacterId !== undefined ? leftCharacterId : undefined,
        rightCharacterId: rightCharacterId !== undefined ? rightCharacterId : undefined,
        displayedMoodId: displayedMoodId !== undefined ? displayedMoodId : undefined,
        leftMoodId: leftMoodId !== undefined ? leftMoodId : undefined,
        rightMoodId: rightMoodId !== undefined ? rightMoodId : undefined
      },
      include: {
        character: true,
        choices: true
      }
    });
    
    res.json(line);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Dialogue line not found' });
    }
    res.status(500).json({ error: 'Failed to update dialogue line' });
  }
});

// Delete dialogue line
router.delete("/lines/:lineId", async (req, res) => {
  try {
    const { lineId } = req.params;
    await prisma.dialogueLine.delete({
      where: { id: lineId }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Dialogue line not found' });
    }
    res.status(500).json({ error: 'Failed to delete dialogue line' });
  }
});

// Add choice to dialogue line
router.post("/lines/:lineId/choices", async (req, res) => {
  try {
    const { lineId } = req.params;
    const { text, nextDialogueId } = req.body;
    
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Choice text is required' });
    }

    const choice = await prisma.dialogueChoice.create({
      data: {
        lineId,
        text: text.trim(),
        nextDialogueId: nextDialogueId || null
      }
    });
    
    res.status(201).json(choice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create dialogue choice' });
  }
});

// Update dialogue choice
router.put("/choices/:choiceId", async (req, res) => {
  try {
    const { choiceId } = req.params;
    const { text, nextDialogueId } = req.body;
    
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Choice text is required' });
    }

    const choice = await prisma.dialogueChoice.update({
      where: { id: choiceId },
      data: {
        text: text.trim(),
        nextDialogueId: nextDialogueId || null
      }
    });
    
    res.json(choice);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Dialogue choice not found' });
    }
    res.status(500).json({ error: 'Failed to update dialogue choice' });
  }
});

// Delete dialogue choice
router.delete("/choices/:choiceId", async (req, res) => {
  try {
    const { choiceId } = req.params;
    await prisma.dialogueChoice.delete({
      where: { id: choiceId }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Dialogue choice not found' });
    }
    res.status(500).json({ error: 'Failed to delete dialogue choice' });
  }
});

export default router;