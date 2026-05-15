import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// Get all social posts for a project
router.get("/project/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId as string;
    const posts = await prisma.socialPost.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch social posts' });
  }
});

// Get single social post
router.get("/:postId", async (req, res) => {
  try {
    const postId = req.params.postId as string;
    const post = await prisma.socialPost.findUnique({
      where: { id: postId }
    });
    if (!post) return res.status(404).json({ error: 'Social post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch social post' });
  }
});

// Create social post
router.post("/", async (req, res) => {
  try {
    const { projectId, content, reportReason } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const post = await prisma.socialPost.create({
      data: {
        projectId,
        content,
        reportReason: reportReason !== undefined ? reportReason : null
      }
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create social post' });
  }
});

// Update social post
router.put("/:postId", async (req, res) => {
  try {
    const postId = req.params.postId as string;
    const { content, reportReason } = req.body;

    const post = await prisma.socialPost.update({
      where: { id: postId },
      data: {
        ...(content !== undefined && { content }),
        ...(reportReason !== undefined && { reportReason: reportReason !== null ? reportReason : null }),
      }
    });
    res.json(post);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Social post not found' });
    }
    res.status(500).json({ error: 'Failed to update social post' });
  }
});

// Delete social post
router.delete("/:postId", async (req, res) => {
  try {
    const postId = req.params.postId as string;
    await prisma.socialPost.delete({
      where: { id: postId }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Social post not found' });
    }
    res.status(500).json({ error: 'Failed to delete social post' });
  }
});

export default router;
