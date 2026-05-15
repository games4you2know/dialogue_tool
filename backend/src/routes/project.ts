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
                }
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        smsConversations: {
          include: {
            npcCharacter: {},
            messages: {
              include: {
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
        },
        calls: {
          include: {
            character: {}
          },
          orderBy: { callDate: 'asc' }
        },
        bankTransactions: {
          orderBy: { createdAt: 'asc' }
        },
        socialPosts: {
          orderBy: { createdAt: 'asc' }
        },
        journalEntries: {
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
      dialogues: (project as any).dialogues.map((dialogue: any) => ({
        tag: dialogue.tag,
        backgroundTag: dialogue.background?.tag || null,
        lines: dialogue.lines.map((line: any) => {
          const secondaryCharacterTag = line.secondaryCharacterId ? characterTagMap.get(line.secondaryCharacterId) || null : null;
          const mainMoodTag = line.mainCharacterMoodId ? moodTagMap.get(line.mainCharacterMoodId) || null : null;
          const secondaryMoodTag = line.secondaryCharacterMoodId ? moodTagMap.get(line.secondaryCharacterMoodId) || null : null;

          return {
            order: line.order,
            characterTag: line.character?.tag || null,
            text: line.text,
            secondaryCharacterTag,
            mainCharacterStaging: {
              characterMoodTag: mainMoodTag,
              characterPosition: line.mainCharacterPosition
            },
            secondaryCharacterStaging: secondaryCharacterTag ? {
              characterMoodTag: secondaryMoodTag,
              characterPosition: line.secondaryCharacterPosition
            } : null,
            triggerCameraShake: line.triggerCameraShake,
            memory: line.memory
          };
        }),
      })),
      smsConversations: (project as any).smsConversations.map((conversation: any) => ({
        tag: conversation.tag,
        characterId: conversation.npcCharacter?.tag || null,
        messages: conversation.messages.map((message: any) => ({
          fromCpu: message.fromCpu,
          content: message.text,
          timestamp: message.timestamp,
          ...(message.questions && message.questions.length > 0 && {
            questions: message.questions.map((question: any) => ({
              content: question.content,
              answers: question.answers.map((answer: any) => ({
                content: answer.content,
                isCorrect: answer.isCorrect,
                ...(answer.cpuResponse && { cpuResponse: answer.cpuResponse }),
              }))
            }))
          })
        })),
      })),
      calls: (project as any).calls.map((call: any) => ({
        contactTag: call.character?.tag || null,
        callDate: call.callDate,
        duration: call.duration,
        status: call.status
      })),
      bankTransactions: (project as any).bankTransactions.map((tx: any) => ({
        type: tx.type,
        name: tx.name,
        paymentType: tx.paymentType,
        amount: tx.amount
      })),
      socialPosts: (project as any).socialPosts.map((post: any) => ({
        content: post.content,
        reportReason: post.reportReason
      })),
      journal: (project as any).journalEntries.map((entry: any) => ({
        ID: entry.entryId,
        Context: entry.context,
        Emotion: entry.emotion,
        Content: entry.content,
        Info: entry.info,
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
