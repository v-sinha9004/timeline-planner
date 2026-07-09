import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/sync — return full state
router.get('/', async (req, res) => {
  try {
    const [subjects, tasks, timeLogs] = await Promise.all([
      prisma.subject.findMany({
        include: { subtopics: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      }),
      prisma.task.findMany({
        include: { recurrence: true, subject: true, subtopic: true },
        orderBy: [{ date: 'asc' }, { order: 'asc' }],
      }),
      prisma.timeLog.findMany({
        include: { task: true },
        orderBy: { startedAt: 'desc' },
      }),
    ]);

    res.json({ subjects, tasks, timeLogs });
  } catch (error) {
    console.error('Error fetching sync data:', error);
    res.status(500).json({ error: 'Failed to fetch sync data' });
  }
});

// POST /api/sync — receive full state and upsert everything
router.post('/', async (req, res) => {
  try {
    const { subjects = [], tasks = [], timeLogs = [] } = req.body;

    await prisma.$transaction(async (tx) => {
      // Upsert subjects and their subtopics
      for (const subject of subjects) {
        const { subtopics, createdAt, updatedAt, ...subjectData } = subject;

        await tx.subject.upsert({
          where: { id: subject.id },
          update: {
            name: subjectData.name,
            color: subjectData.color,
            icon: subjectData.icon,
            order: subjectData.order ?? 0,
          },
          create: {
            id: subject.id,
            name: subjectData.name,
            color: subjectData.color,
            icon: subjectData.icon,
            order: subjectData.order ?? 0,
          },
        });

        if (subtopics && subtopics.length > 0) {
          for (const subtopic of subtopics) {
            const { subject: _s, tasks: _t, createdAt: _c, updatedAt: _u, ...subtopicData } = subtopic;
            await tx.subtopic.upsert({
              where: { id: subtopic.id },
              update: {
                name: subtopicData.name,
                subjectId: subject.id,
                startDate: subtopicData.startDate ? new Date(subtopicData.startDate) : null,
                endDate: subtopicData.endDate ? new Date(subtopicData.endDate) : null,
                estimatedHours: subtopicData.estimatedHours,
                notes: subtopicData.notes,
                completed: subtopicData.completed ?? false,
                order: subtopicData.order ?? 0,
              },
              create: {
                id: subtopic.id,
                name: subtopicData.name,
                subjectId: subject.id,
                startDate: subtopicData.startDate ? new Date(subtopicData.startDate) : null,
                endDate: subtopicData.endDate ? new Date(subtopicData.endDate) : null,
                estimatedHours: subtopicData.estimatedHours,
                notes: subtopicData.notes,
                completed: subtopicData.completed ?? false,
                order: subtopicData.order ?? 0,
              },
            });
          }
        }
      }

      // Upsert tasks and their recurrences
      for (const task of tasks) {
        const { recurrence, subject, subtopic, timeLogs: _tl, createdAt, updatedAt, ...taskData } = task;

        await tx.task.upsert({
          where: { id: task.id },
          update: {
            title: taskData.title,
            subjectId: taskData.subjectId || null,
            subtopicId: taskData.subtopicId || null,
            date: taskData.date ? new Date(taskData.date) : null,
            startDate: taskData.startDate ? new Date(taskData.startDate) : null,
            endDate: taskData.endDate ? new Date(taskData.endDate) : null,
            startTime: taskData.startTime,
            endTime: taskData.endTime,
            priority: taskData.priority || 'MEDIUM',
            status: taskData.status || 'PENDING',
            isTest: taskData.isTest ?? false,
            tags: taskData.tags ?? [],
            order: taskData.order ?? 0,
          },
          create: {
            id: task.id,
            title: taskData.title,
            subjectId: taskData.subjectId || null,
            subtopicId: taskData.subtopicId || null,
            date: taskData.date ? new Date(taskData.date) : null,
            startDate: taskData.startDate ? new Date(taskData.startDate) : null,
            endDate: taskData.endDate ? new Date(taskData.endDate) : null,
            startTime: taskData.startTime,
            endTime: taskData.endTime,
            priority: taskData.priority || 'MEDIUM',
            status: taskData.status || 'PENDING',
            isTest: taskData.isTest ?? false,
            tags: taskData.tags ?? [],
            order: taskData.order ?? 0,
          },
        });

        // Handle recurrence
        if (recurrence) {
          const { id: recId, taskId: _tid, task: _t, createdAt: _rc, ...recData } = recurrence;
          await tx.recurrence.upsert({
            where: { taskId: task.id },
            update: {
              type: recData.type,
              interval: recData.interval ?? 1,
              daysOfWeek: recData.daysOfWeek ?? [],
            },
            create: {
              taskId: task.id,
              type: recData.type,
              interval: recData.interval ?? 1,
              daysOfWeek: recData.daysOfWeek ?? [],
            },
          });
        }
      }

      // Upsert time logs
      for (const log of timeLogs) {
        const { task: _t, createdAt: _c, ...logData } = log;
        await tx.timeLog.upsert({
          where: { id: log.id },
          update: {
            taskId: logData.taskId,
            startedAt: new Date(logData.startedAt),
            endedAt: logData.endedAt ? new Date(logData.endedAt) : null,
            duration: logData.duration ?? 0,
            date: new Date(logData.date),
          },
          create: {
            id: log.id,
            taskId: logData.taskId,
            startedAt: new Date(logData.startedAt),
            endedAt: logData.endedAt ? new Date(logData.endedAt) : null,
            duration: logData.duration ?? 0,
            date: new Date(logData.date),
          },
        });
      }
    });

    res.json({ message: 'Sync completed successfully' });
  } catch (error) {
    console.error('Error syncing data:', error);
    res.status(500).json({ error: 'Failed to sync data', details: error.message });
  }
});

export default router;
