import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/breaks
router.get('/', async (req, res) => {
  try {
    const { owner } = req.query;
    if (!owner) {
      return res.status(400).json({ error: 'owner is required' });
    }

    const breaks = await prisma.break.findMany({
      where: {
        owner: String(owner),
        undone: false,
      },
    });
    res.json(breaks);
  } catch (error) {
    console.error('Error fetching breaks:', error);
    res.status(500).json({ error: 'Failed to fetch breaks' });
  }
});

// POST /api/breaks
router.post('/', async (req, res) => {
  try {
    const { owner, date } = req.body;
    if (!owner || !date) {
      return res.status(400).json({ error: 'owner and date are required' });
    }

    const breakDateObj = new Date(date);
    const month = breakDateObj.getMonth() + 1;
    const year = breakDateObj.getFullYear();

    const breakCount = await prisma.break.count({
      where: {
        owner,
        month,
        year,
        undone: false
      }
    });

    if (breakCount >= 2) {
      return res.status(400).json({ error: 'Break limit reached for this month (max 2)' });
    }

    const startOfDay = new Date(breakDateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(breakDateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const activeBreak = await prisma.break.findFirst({
      where: {
        owner,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        undone: false
      }
    });

    if (activeBreak) {
      return res.status(400).json({ error: 'Active break already exists on this date' });
    }

    const breakRecord = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`UPDATE "Task" SET "date" = "date" + INTERVAL '1 day', "updatedAt" = NOW() WHERE "owner" = ${owner} AND "date" >= ${breakDateObj}::timestamp`;
      await tx.$executeRaw`UPDATE "Task" SET "startDate" = "startDate" + INTERVAL '1 day', "updatedAt" = NOW() WHERE "owner" = ${owner} AND "startDate" >= ${breakDateObj}::timestamp`;
      await tx.$executeRaw`UPDATE "Task" SET "endDate" = "endDate" + INTERVAL '1 day', "updatedAt" = NOW() WHERE "owner" = ${owner} AND "endDate" >= ${breakDateObj}::timestamp`;

      return await tx.break.create({
        data: {
          owner,
          date: breakDateObj,
          month,
          year,
          undone: false
        }
      });
    });

    res.status(201).json(breakRecord);
  } catch (error) {
    console.error('Error creating break:', error);
    res.status(500).json({ error: 'Failed to create break' });
  }
});

// PUT /api/breaks/:id/undo
router.put('/:id/undo', async (req, res) => {
  try {
    const breakId = req.params.id;

    const breakRecord = await prisma.break.findUnique({
      where: { id: breakId }
    });

    if (!breakRecord) {
      return res.status(404).json({ error: 'Break not found' });
    }

    if (breakRecord.undone) {
      return res.status(400).json({ error: 'Break already undone' });
    }

    const breakDateObj = breakRecord.date;
    const owner = breakRecord.owner;

    const updatedBreak = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`UPDATE "Task" SET "date" = "date" - INTERVAL '1 day', "updatedAt" = NOW() WHERE "owner" = ${owner} AND "date" > ${breakDateObj}::timestamp`;
      await tx.$executeRaw`UPDATE "Task" SET "startDate" = "startDate" - INTERVAL '1 day', "updatedAt" = NOW() WHERE "owner" = ${owner} AND "startDate" > ${breakDateObj}::timestamp`;
      await tx.$executeRaw`UPDATE "Task" SET "endDate" = "endDate" - INTERVAL '1 day', "updatedAt" = NOW() WHERE "owner" = ${owner} AND "endDate" > ${breakDateObj}::timestamp`;

      return await tx.break.update({
        where: { id: breakId },
        data: { undone: true }
      });
    });

    res.json(updatedBreak);
  } catch (error) {
    console.error('Error undoing break:', error);
    res.status(500).json({ error: 'Failed to undo break' });
  }
});

export default router;
