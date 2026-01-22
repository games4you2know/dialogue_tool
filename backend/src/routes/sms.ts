import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

// Helper function to parse question reactions
const parseQuestionReactions = (question: any) => {
  return {
    ...question,
    reactions: {
      positive: JSON.parse(question.positiveReactions || '[]'),
      negative: JSON.parse(question.negativeReactions || '[]')
    }
  };
};

const transformConversationData = (conversation: any) => {
  if (!conversation) return conversation;
  
  return {
    ...conversation,
    messages: conversation.messages?.map((message: any) => ({
      ...message,
      questions: message.questions?.map((question: any) => parseQuestionReactions(question))
    }))
  };
};

// Get all SMS conversations for a project
router.get("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const conversations = await prisma.sMSConversation.findMany({
      where: { projectId },
      include: {
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
                  orderBy: { order: 'asc' }
                }
              }
            }
          },
          orderBy: { timestamp: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(conversations.map(transformConversationData));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SMS conversations' });
  }
});

// Get single SMS conversation
router.get("/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await prisma.sMSConversation.findUnique({
      where: { id: conversationId },
      include: {
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
                  orderBy: { order: 'asc' }
                }
              }
            }
          },
          orderBy: { timestamp: 'asc' }
        }
      }
    });
    if (!conversation) return res.status(404).json({ error: "SMS conversation not found" });
    res.json(transformConversationData(conversation));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SMS conversation' });
  }
});

// Create SMS conversation
router.post("/", async (req, res) => {
  try {
    const { projectId, name, folderId } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Conversation name is required' });
    }
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    const conversation = await prisma.sMSConversation.create({
      data: {
        projectId,
        name: name.trim(),
        folderId: folderId || null
      },
      include: {
        participants: {
          include: {
            character: true
          }
        },
        messages: {
          include: {
            character: true
          }
        }
      }
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
    const { name, folderId } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Conversation name is required' });
    }

    const conversation = await prisma.sMSConversation.update({
      where: { id: conversationId },
      data: {
        name: name.trim(),
        folderId: folderId || null
      },
      include: {
        participants: {
          include: {
            character: true
          }
        },
        messages: {
          include: {
            character: true
          },
          orderBy: { timestamp: 'asc' }
        }
      }
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
    const { conversationId } = req.params;
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
    const { characterId, text, timestamp } = req.body;
    
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const message = await prisma.sMSMessage.create({
      data: {
        conversationId,
        characterId: characterId || null,
        text: text.trim(),
        timestamp: timestamp ? new Date(timestamp) : new Date()
      },
      include: {
        character: true
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
    const { characterId, text, timestamp } = req.body;
    
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const updateData: any = {
      text: text.trim()
    };
    
    if (characterId !== undefined) {
      updateData.characterId = characterId;
    }
    
    if (timestamp) {
      updateData.timestamp = new Date(timestamp);
    }

    const message = await prisma.sMSMessage.update({
      where: { id: messageId },
      data: updateData,
      include: {
        character: true
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
    const { messageId } = req.params;
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
    const { content, answers, reactions } = req.body;
    
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Question content is required' });
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'At least one answer is required' });
    }

    const positiveReactions = reactions?.positive || [];
    const negativeReactions = reactions?.negative || [];

    const question = await prisma.sMSQuestion.create({
      data: {
        messageId,
        content: content.trim(),
        positiveReactions: JSON.stringify(positiveReactions),
        negativeReactions: JSON.stringify(negativeReactions),
        answers: {
          create: answers.map((answer: any, index: number) => ({
            content: answer.content,
            isCorrect: answer.isCorrect || false,
            order: answer.order !== undefined ? answer.order : index
          }))
        }
      },
      include: {
        answers: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    res.status(201).json(parseQuestionReactions(question));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Update question
router.put("/questions/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content, answers, reactions } = req.body;
    
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Question content is required' });
    }

    const positiveReactions = reactions?.positive || [];
    const negativeReactions = reactions?.negative || [];

    // Delete existing answers
    await prisma.sMSAnswer.deleteMany({
      where: { questionId }
    });

    // Update question and create new answers
    const question = await prisma.sMSQuestion.update({
      where: { id: questionId },
      data: {
        content: content.trim(),
        positiveReactions: JSON.stringify(positiveReactions),
        negativeReactions: JSON.stringify(negativeReactions),
        answers: {
          create: answers.map((answer: any, index: number) => ({
            content: answer.content,
            isCorrect: answer.isCorrect || false,
            order: answer.order !== undefined ? answer.order : index
          }))
        }
      },
      include: {
        answers: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    res.json(parseQuestionReactions(question));
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
    const { questionId } = req.params;
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
