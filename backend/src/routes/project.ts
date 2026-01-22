import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = Router();

// Get all projects
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("Fetching all projects...");
    
    // Récupérer les projets où l'utilisateur est propriétaire ou membre
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
                name: true,
                email: true,
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

    // Récupérer les projets où l'utilisateur est membre
    const memberProjects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: (req as any).userId,
          },
        },
        userId: {
          not: (req as any).userId, // Exclure les projets déjà dans ownedProjects
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
                name: true,
                email: true,
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
    console.log(`Found ${projects.length} projects`);
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
    
    // Créer le projet
    const project = await prisma.project.create({ 
      data: { 
        name: name.trim(), 
        description: description?.trim() || null,
        userId 
      }
    });

    // Ajouter automatiquement le créateur comme membre avec le rôle owner
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
                  include: {
                    moods: true // Inclure les moods des personnages du dialogue
                  }
                }
              }
            },
            lines: {
              include: {
                character: {
                  include: {
                    moods: true // Inclure les moods du personnage de la ligne
                  }
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
            folder: true, // Inclure le dossier de la conversation
            participants: {
              include: {
                character: {
                  include: {
                    moods: true // Inclure les moods des participants
                  }
                }
              }
            },
            messages: {
              include: {
                character: {
                  include: {
                    moods: true // Inclure les moods du personnage du message
                  }
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
    
    const exportJson = {
      dialogues: project.dialogues.map(dialogue => ({
        backgroundName: dialogue.background?.name,
        lines: dialogue.lines.map(line => ({
          order: line.order,
          characterTag: line.character.tag,
          text: line.text,
          displayedCharacterId: line.displayedCharacterId,
          leftCharacterId: line.leftCharacterId,
          rightCharacterId: line.rightCharacterId,
          displayedMoodId: line.displayedMoodId,
          leftMoodId: line.leftMoodId,
          rightMoodId: line.rightMoodId,
          conditions: line.conditions,
          actions: line.actions,
          choices: line.choices
        })),
      })),
      smsConversations: project.smsConversations.map(conversation => ({
        isGroupChat: conversation.isGroupChat,
        participants: conversation.participants.map(p => p.character),
        messages: conversation.messages.map(message => ({
          characterTag: message.character.tag,
          text: message.text,
          timestamp: message.timestamp,
          isRead: message.isRead,
          messageType: message.messageType,
          attachmentUrl: message.attachmentUrl,
          questions: message.questions.map(question => ({
            content: question.content,
            positiveReactions: JSON.parse(question.positiveReactions),
            negativeReactions: JSON.parse(question.negativeReactions),
            answers: question.answers.map(answer => ({
              content: answer.content,
              isCorrect: answer.isCorrect,
              order: answer.order
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
