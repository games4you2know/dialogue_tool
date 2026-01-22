import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all folders for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { type } = req.query;
    
    const where: any = { projectId };
    if (type) {
      where.type = type;
    }
    
    const folders = await prisma.folder.findMany({
      where,
      include: {
        _count: {
          select: {
            dialogues: true,
            smsConversations: true,
            children: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// Get folder by ID with its content
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        dialogues: {
          include: {
            characters: {
              include: {
                character: true,
              },
            },
          },
        },
        smsConversations: {
          include: {
            participants: {
              include: {
                character: true,
              },
            },
          },
        },
        children: true,
        parent: true,
      },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.json(folder);
  } catch (error) {
    console.error('Error fetching folder:', error);
    res.status(500).json({ error: 'Failed to fetch folder' });
  }
});

// Create a new folder
router.post('/', async (req, res) => {
  try {
    const { projectId, name, description, type, parentId } = req.body;

    if (!projectId || !name) {
      return res.status(400).json({ error: 'projectId and name are required' });
    }

    if (!type || (type !== 'dialogue' && type !== 'sms')) {
      return res.status(400).json({ error: 'type must be either "dialogue" or "sms"' });
    }

    const folder = await prisma.folder.create({
      data: {
        projectId,
        name,
        description,
        type,
        parentId,
      },
      include: {
        _count: {
          select: {
            dialogues: true,
            smsConversations: true,
            children: true,
          },
        },
      },
    });

    res.status(201).json(folder);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Update a folder
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parentId } = req.body;

    const folder = await prisma.folder.update({
      where: { id },
      data: {
        name,
        description,
        parentId,
      },
      include: {
        _count: {
          select: {
            dialogues: true,
            smsConversations: true,
            children: true,
          },
        },
      },
    });

    res.json(folder);
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({ error: 'Failed to update folder' });
  }
});

// Delete a folder
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            dialogues: true,
            smsConversations: true,
            children: true,
          },
        },
      },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    await prisma.folder.delete({
      where: { id },
    });

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

// Move dialogue to folder
router.post('/move-dialogue', async (req, res) => {
  try {
    const { dialogueId, folderId } = req.body;

    const dialogue = await prisma.dialogue.update({
      where: { id: dialogueId },
      data: { folderId },
    });

    res.json(dialogue);
  } catch (error) {
    console.error('Error moving dialogue:', error);
    res.status(500).json({ error: 'Failed to move dialogue' });
  }
});

// Move SMS conversation to folder
router.post('/move-sms', async (req, res) => {
  try {
    const { conversationId, folderId } = req.body;

    const conversation = await prisma.sMSConversation.update({
      where: { id: conversationId },
      data: { folderId },
    });

    res.json(conversation);
  } catch (error) {
    console.error('Error moving SMS conversation:', error);
    res.status(500).json({ error: 'Failed to move SMS conversation' });
  }
});

export default router;
