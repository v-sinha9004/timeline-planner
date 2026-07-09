import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/timelogs?date=YYYY-MM-DD — get time logs for a date
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    const where = {};

    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: d, lt: nextDay };
    }

    const timeLogs = await prisma.timeLog.findMany({
      where,
      include: { task: { include: { subject: true } } },
      orderBy: { startedAt: 'desc' },
    });
    res.json(timeLogs);
  } catch (error) {
    console.error('Error fetching time logs:', error);
    res.status(500).json({ error: 'Failed to fetch time logs' });
  }
});

// GET /api/timelogs/summary?date=YYYY-MM-DD — daily summary
router.get('/summary', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date query param required' });

    const d = new Date(date);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);

    const timeLogs = await prisma.timeLog.findMany({
      where: { date: { gte: d, lt: nextDay } },
      include: { task: true },
    });

    const totalSeconds = timeLogs.reduce((sum, log) => sum + log.duration, 0);

    const perTask = {};
    for (const log of timeLogs) {
      const taskId = log.taskId;
      if (!perTask[taskId]) {
        perTask[taskId] = {
          taskId,
          taskTitle: log.task?.title || 'Unknown',
          totalSeconds: 0,
        };
      }
      perTask[taskId].totalSeconds += log.duration;
    }

    res.json({
      date,
      totalSeconds,
      tasks: Object.values(perTask),
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// POST /api/timelogs — create time log
router.post('/', async (req, res) => {
  try {
    const { taskId, isBreak, startedAt, date, endedAt, duration } = req.body;
    const timeLog = await prisma.timeLog.create({
      data: {
        taskId: taskId === 'break' ? null : taskId,
        isBreak: isBreak || taskId === 'break' || false,
        startedAt: new Date(startedAt),
        endedAt: endedAt ? new Date(endedAt) : null,
        duration: duration ?? 0,
        date: new Date(date),
      },
      include: { task: true },
    });
    res.status(201).json(timeLog);
  } catch (error) {
    console.error('Error creating time log:', error);
    res.status(500).json({ error: 'Failed to create time log' });
  }
});

// PUT /api/timelogs/:id — update time log
router.put('/:id', async (req, res) => {
  try {
    const { endedAt, duration, startedAt } = req.body;
    const data = {};
    if (endedAt !== undefined) data.endedAt = endedAt ? new Date(endedAt) : null;
    if (duration !== undefined) data.duration = duration;
    if (startedAt !== undefined) data.startedAt = new Date(startedAt);

    const timeLog = await prisma.timeLog.update({
      where: { id: req.params.id },
      data,
      include: { task: true },
    });
    res.json(timeLog);
  } catch (error) {
    console.error('Error updating time log:', error);
    res.status(500).json({ error: 'Failed to update time log' });
  }
});

export default router;
