import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// Get all bank transactions for a project
router.get("/project/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId as string;
    const transactions = await prisma.bankTransaction.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bank transactions' });
  }
});

// Get single bank transaction
router.get("/:transactionId", async (req, res) => {
  try {
    const transactionId = req.params.transactionId as string;
    const transaction = await prisma.bankTransaction.findUnique({
      where: { id: transactionId }
    });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bank transaction' });
  }
});

// Create bank transaction
router.post("/", async (req, res) => {
  try {
    const { projectId, type, name, paymentType, amount } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const transaction = await prisma.bankTransaction.create({
      data: {
        projectId,
        type: type !== undefined ? type : 0,
        name,
        paymentType: paymentType !== undefined ? paymentType : 0,
        amount: amount !== undefined ? amount : 0
      }
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bank transaction' });
  }
});

// Update bank transaction
router.put("/:transactionId", async (req, res) => {
  try {
    const transactionId = req.params.transactionId as string;
    const { type, name, paymentType, amount } = req.body;

    const transaction = await prisma.bankTransaction.update({
      where: { id: transactionId },
      data: {
        type: type !== undefined ? type : undefined,
        name: name !== undefined ? name : undefined,
        paymentType: paymentType !== undefined ? paymentType : undefined,
        amount: amount !== undefined ? amount : undefined
      }
    });
    res.json(transaction);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(500).json({ error: 'Failed to update bank transaction' });
  }
});

// Delete bank transaction
router.delete("/:transactionId", async (req, res) => {
  try {
    const transactionId = req.params.transactionId as string;
    await prisma.bankTransaction.delete({
      where: { id: transactionId }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(500).json({ error: 'Failed to delete bank transaction' });
  }
});

export default router;
