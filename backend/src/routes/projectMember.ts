import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get all members of a project
router.get("/project/:projectId", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: (req as any).userId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json(members);
  } catch (error) {
    console.error("Error fetching project members:", error);
    res.status(500).json({ error: "Failed to fetch project members" });
  }
});

// Add a member to a project
router.post("/project/:projectId", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { username, role = "member" } = req.body;

    const requesterMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: (req as any).userId,
        },
      },
    });

    if (!requesterMember || (requesterMember.role !== "owner" && requesterMember.role !== "admin")) {
      return res.status(403).json({ error: "Seuls les propriétaires et admins peuvent ajouter des membres" });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: "Cet utilisateur est déjà membre du projet" });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: user.id,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json(member);
  } catch (error) {
    console.error("Error adding project member:", error);
    res.status(500).json({ error: "Failed to add project member" });
  }
});

// Update member role
router.put("/:memberId", authMiddleware, async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;

    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return res.status(404).json({ error: "Membre non trouvé" });
    }

    const requesterMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: member.projectId,
          userId: (req as any).userId,
        },
      },
    });

    if (!requesterMember || (requesterMember.role !== "owner" && requesterMember.role !== "admin")) {
      return res.status(403).json({ error: "Seuls les propriétaires et admins peuvent modifier les rôles" });
    }

    if (member.role === "owner") {
      return res.status(403).json({ error: "Le rôle du propriétaire ne peut pas être modifié" });
    }

    const updatedMember = await prisma.projectMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.json(updatedMember);
  } catch (error) {
    console.error("Error updating member role:", error);
    res.status(500).json({ error: "Failed to update member role" });
  }
});

// Remove a member from a project
router.delete("/:memberId", authMiddleware, async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return res.status(404).json({ error: "Membre non trouvé" });
    }

    const requesterMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: member.projectId,
          userId: (req as any).userId,
        },
      },
    });

    if (!requesterMember || (requesterMember.role !== "owner" && requesterMember.role !== "admin")) {
      return res.status(403).json({ error: "Seuls les propriétaires et admins peuvent retirer des membres" });
    }

    if (member.role === "owner") {
      return res.status(403).json({ error: "Le propriétaire ne peut pas être retiré du projet" });
    }

    await prisma.projectMember.delete({
      where: { id: memberId },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error removing project member:", error);
    res.status(500).json({ error: "Failed to remove project member" });
  }
});

export default router;
