import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

const conversationInclude = {
  npcCharacter: true,
  participants: {
    include: {
      character: true
    }
  },
  messages: {
    include: {
      character: true,
      questions: {
        include: {
          answers: {
            orderBy: { order: 'asc' as const }
          }
        }
      }
    },
    orderBy: { timestamp: 'asc' as const }
  }
};

// Get all SMS conversations for a project
router.get("/project/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId as string;
    const conversations = await prisma.sMSConversation.findMany({
      where: { projectId },
      include: conversationInclude,
      orderBy: { name: 'asc' }
    });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SMS conversations' });
  }
});

// Get single SMS conversation
router.get("/:conversationId", async (req, res) => {
  try {
    const conversationId = req.params.conversationId as string;
    const conversation = await prisma.sMSConversation.findUnique({
      where: { id: conversationId },
      include: conversationInclude
    });
    if (!conversation) return res.status(404).json({ error: "SMS conversation not found" });
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SMS conversation' });
  }
});

// Create SMS conversation
router.post("/", async (req, res) => {
  try {
    const { projectId, name, tag, folderId, npcCharacterId } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Conversation name is required' });
    }
    if (!tag?.trim()) {
      return res.status(400).json({ error: 'Conversation tag is required' });
    }
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    const conversation = await prisma.sMSConversation.create({
      data: {
        projectId,
        name: name.trim(),
        tag: tag.trim(),
        folderId: folderId || null,
        npcCharacterId: npcCharacterId || null
      },
      include: conversationInclude
    });
    
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create SMS conversation' });
  }
});

// Update SMS conversation
router.put("/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { name, tag, folderId, npcCharacterId } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Conversation name is required' });
    }

    const conversation = await prisma.sMSConversation.update({
      where: { id: conversationId },
      data: {
        name: name.trim(),
        ...(tag && { tag: tag.trim() }),
        folderId: folderId || null,
        ...(npcCharacterId !== undefined && { npcCharacterId: npcCharacterId || null })
      },
      include: conversationInclude
    });
    
    res.json(conversation);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'SMS conversation not found' });
    }
    res.status(500).json({ error: 'Failed to update SMS conversation' });
  }
});

// Delete SMS conversation
router.delete("/:conversationId", async (req, res) => {
  try {
    const conversationId = req.params.conversationId as string;
    await prisma.sMSConversation.delete({
      where: { id: conversationId }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'SMS conversation not found' });
    }
    res.status(500).json({ error: 'Failed to delete SMS conversation' });
  }
});

// Add SMS message
router.post("/:conversationId/messages", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { fromCpu, text, timestamp } = req.body;
    
    if (text === undefined || text === null) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const message = await prisma.sMSMessage.create({
      data: {
        conversationId,
        fromCpu: fromCpu === true,
        text: text,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      },
      include: {
        character: true,
        questions: {
          include: {
            answers: { orderBy: { order: 'asc' } }
          }
        }
      }
    });
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create SMS message' });
  }
});

// Update SMS message
router.put("/messages/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { fromCpu, text, timestamp } = req.body;

    const message = await prisma.sMSMessage.update({
      where: { id: messageId },
      data: {
        ...(text !== undefined && { text }),
        ...(fromCpu !== undefined && { fromCpu: fromCpu === true }),
        ...(timestamp && { timestamp: new Date(timestamp) })
      },
      include: {
        character: true,
        questions: {
          include: {
            answers: { orderBy: { order: 'asc' } }
          }
        }
      }
    });
    
    res.json(message);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'SMS message not found' });
    }
    res.status(500).json({ error: 'Failed to update SMS message' });
  }
});

// Delete SMS message
router.delete("/messages/:messageId", async (req, res) => {
  try {
    const messageId = req.params.messageId as string;
    await prisma.sMSMessage.delete({
      where: { id: messageId }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'SMS message not found' });
    }
    res.status(500).json({ error: 'Failed to delete SMS message' });
  }
});

// Add question to SMS message
router.post("/messages/:messageId/questions", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content, answers } = req.body;
    
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Question content is required' });
    }
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'At least one answer is required' });
    }

    const question = await prisma.sMSQuestion.create({
      data: {
        messageId,
        content: content.trim(),
        positiveReactions: null,
        negativeReactions: null,
        answers: {
          create: answers.map((answer: any, index: number) => ({
            content: answer.content,
            isCorrect: answer.isCorrect || false,
            order: answer.order !== undefined ? answer.order : index,
            cpuResponse: answer.cpuResponse || null
          }))
        }
      },
      include: {
        answers: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    res.status(201).json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Update question
router.put("/questions/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content, answers } = req.body;
    
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Question content is required' });
    }

    await prisma.sMSAnswer.deleteMany({
      where: { questionId }
    });

    const question = await prisma.sMSQuestion.update({
      where: { id: questionId },
      data: {
        content: content.trim(),
        answers: {
          create: answers.map((answer: any, index: number) => ({
            content: answer.content,
            isCorrect: answer.isCorrect || false,
            order: answer.order !== undefined ? answer.order : index,
            cpuResponse: answer.cpuResponse || null
          }))
        }
      },
      include: {
        answers: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    res.json(question);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete question
router.delete("/questions/:questionId", async (req, res) => {
  try {
    const questionId = req.params.questionId as string;
    await prisma.sMSQuestion.delete({
      where: { id: questionId }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

export default router;
