import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = Router();

// Get all projects
router.get("/", authMiddleware, async (req, res) => {
  try {
    const ownedProjects = await prisma.project.findMany({
      where: {
        userId: (req as any).userId,
      },
      include: { 
        characters: true,
        backgrounds: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        dialogues: {
          include: {
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
        },
        smsConversations: {
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
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const memberProjects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: (req as any).userId,
          },
        },
        userId: {
          not: (req as any).userId,
        },
      },
      include: { 
        characters: true,
        backgrounds: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        dialogues: {
          include: {
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
        },
        smsConversations: {
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
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const projects = [...ownedProjects, ...memberProjects];
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project
router.get("/:projectId", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: "Project ID is required" });
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { 
        characters: true,
        backgrounds: true,
        dialogues: {
          include: {
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
        },
        smsConversations: {
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
        }
      }
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create project
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    const userId = (req as any).userId;
    
    const project = await prisma.project.create({ 
      data: { 
        name: name.trim(), 
        description: description?.trim() || null,
        userId 
      }
    });

    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId,
        role: 'owner',
      },
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put("/:projectId", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: "Project ID is required" });
    
    const { name, description } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { 
        name: name.trim(), 
        description: description?.trim() || null,
        updatedAt: new Date()
      }
    });
    res.json(project);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete("/:projectId", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: "Project ID is required" });
    
    await prisma.project.delete({
      where: { id: projectId }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Export project as JSON
router.get("/:projectId/export", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: "Project ID is required" });
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        folders: {
          orderBy: { createdAt: 'asc' }
        },
        dialogues: {
          include: {
            background: true,
            characters: {
              include: {
                character: {
                }
              }
            },
            lines: {
              include: {
                character: {
                },
                choices: {
                  orderBy: { id: 'asc' }
                }
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        smsConversations: {
          include: {
            folder: true,
            participants: {
              include: {
                character: {
                }
              }
            },
            messages: {
              include: {
                character: {
                },
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
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!project) return res.status(404).json({ error: "Project not found" });

    const characters = await prisma.character.findMany({
      where: { projectId }
    });
    const moods = await prisma.mood.findMany({
      where: { projectId }
    });

    const characterTagMap = new Map(characters.map(c => [c.id, c.tag]));
    const moodTagMap = new Map(moods.map(m => [m.id, m.tag]));
    
    const exportJson = {
      dialogues: project.dialogues.map((dialogue: any) => ({
        tag: dialogue.tag,
        backgroundTag: dialogue.background?.tag || null,
        lines: dialogue.lines.map((line: any) => {
          const displayedCharacterTag = line.displayedCharacterId ? characterTagMap.get(line.displayedCharacterId) || null : null;
          const leftCharacterTag = line.leftCharacterId ? characterTagMap.get(line.leftCharacterId) || null : null;
          const rightCharacterTag = line.rightCharacterId ? characterTagMap.get(line.rightCharacterId) || null : null;
          const displayedMoodTag = line.displayedMoodId ? moodTagMap.get(line.displayedMoodId) || null : null;
          const leftMoodTag = line.leftMoodId ? moodTagMap.get(line.leftMoodId) || null : null;
          const rightMoodTag = line.rightMoodId ? moodTagMap.get(line.rightMoodId) || null : null;

          const hasSingleCharacter = displayedCharacterTag && !leftCharacterTag && !rightCharacterTag;

          return {
            order: line.order,
            characterTag: line.character?.tag || null,
            text: line.text,
            leftCharacterTag: hasSingleCharacter ? displayedCharacterTag : leftCharacterTag,
            rightCharacterTag: hasSingleCharacter ? null : rightCharacterTag,
            leftMoodTag: hasSingleCharacter ? displayedMoodTag : leftMoodTag,
            rightMoodTag: hasSingleCharacter ? null : rightMoodTag,
            leftCharacterActive: hasSingleCharacter ? true : (line.leftCharacterActive || false),
            rightCharacterActive: hasSingleCharacter ? false : (line.rightCharacterActive || false),
            choices: line.choices
          };
        }),
      })),
      smsConversations: project.smsConversations.map((conversation: any) => ({
        tag: conversation.tag,
        isGroupChat: conversation.isGroupChat,
        participants: conversation.participants.map((p: any) => p.character.tag),
        messages: conversation.messages.map((message: any) => ({
          senderTag: message.character.tag,
          content: message.text,
          timestamp: message.timestamp,
          isRead: message.isRead,
          questions: message.questions.map((question: any, index: number) => ({
            order: index,
            content: question.content,
            reactions: {
              positive: JSON.parse(question.positiveReactions),
              negative: JSON.parse(question.negativeReactions)
            },
            answers: question.answers.map((answer: any) => ({
              content: answer.content,
              isCorrect: answer.isCorrect
            }))
          }))
        })),
      }))
    };
    
    res.setHeader("Content-Disposition", `attachment; filename="${project.name}.json"`);
    res.json(exportJson);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export project' });
  }
});

export default router;
