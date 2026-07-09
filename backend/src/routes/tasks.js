import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/tasks — list tasks with optional filters
router.get('/', async (req, res) => {
  try {
    const { date, subjectId, status, startDate, endDate, owner } = req.query;
    const where = {};
    
    if (owner) where.owner = owner;

    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: d, lt: nextDay };
    }

    if (subjectId) where.subjectId = subjectId;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.date = where.date || {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        where.date.lt = end;
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        recurrence: true,
        subject: true,
        subtopic: true,
      },
      orderBy: [{ date: 'asc' }, { order: 'asc' }],
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /api/tasks/:id — get one task
router.get('/:id', async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        recurrence: true,
        subject: true,
        subtopic: true,
      },
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST /api/tasks — create task with optional recurrence
router.post('/', async (req, res) => {
  try {
    const { recurrence, date, startDate, endDate, ...taskData } = req.body;

    if (taskData.subjectId === '') taskData.subjectId = null;
    if (taskData.subtopicId === '') taskData.subtopicId = null;

    const task = await prisma.task.create({
      data: {
        ...taskData,
        date: date ? new Date(date) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        ...(recurrence && {
          recurrence: {
            create: {
              type: recurrence.type,
              interval: recurrence.interval ?? 1,
              daysOfWeek: recurrence.daysOfWeek ?? [],
            },
          },
        }),
      },
      include: { recurrence: true, subject: true, subtopic: true },
    });
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id — update task with optional recurrence
router.put('/:id', async (req, res) => {
  try {
    const { recurrence, date, startDate, endDate, ...taskData } = req.body;

    // Remove fields that shouldn't be passed to update
    delete taskData.id;
    delete taskData.createdAt;
    delete taskData.updatedAt;
    delete taskData.subject;
    delete taskData.subtopic;
    delete taskData.timeLogs;

    if (taskData.subjectId === '') taskData.subjectId = null;
    if (taskData.subtopicId === '') taskData.subtopicId = null;

    if (date !== undefined) taskData.date = date ? new Date(date) : null;
    if (startDate !== undefined) taskData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) taskData.endDate = endDate ? new Date(endDate) : null;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: taskData,
      include: { recurrence: true, subject: true, subtopic: true },
    });

    // Handle recurrence separately
    if (recurrence !== undefined) {
      // Delete existing recurrence
      await prisma.recurrence.deleteMany({ where: { taskId: req.params.id } });

      if (recurrence) {
        await prisma.recurrence.create({
          data: {
            taskId: req.params.id,
            type: recurrence.type,
            interval: recurrence.interval ?? 1,
            daysOfWeek: recurrence.daysOfWeek ?? [],
          },
        });
      }
    }

    // Refetch with updated recurrence
    const updated = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { recurrence: true, subject: true, subtopic: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id — delete task
router.delete('/:id', async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
