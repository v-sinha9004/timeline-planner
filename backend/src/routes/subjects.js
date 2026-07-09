import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/subjects — list all subjects with subtopics
router.get('/', async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: { subtopics: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    });
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// GET /api/subjects/:id — get one subject with subtopics
router.get('/:id', async (req, res) => {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: req.params.id },
      include: { subtopics: { orderBy: { order: 'asc' } } },
    });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

// POST /api/subjects — create subject
router.post('/', async (req, res) => {
  try {
    const { id, name, color, icon, order } = req.body;
    const subject = await prisma.subject.create({
      data: { id, name, color, icon, order: order ?? 0 },
      include: { subtopics: true },
    });
    res.status(201).json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// PUT /api/subjects/:id — update subject
router.put('/:id', async (req, res) => {
  try {
    const { name, color, icon, order } = req.body;
    const subject = await prisma.subject.update({
      where: { id: req.params.id },
      data: { name, color, icon, order },
      include: { subtopics: true },
    });
    res.json(subject);
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// DELETE /api/subjects/:id — delete subject
router.delete('/:id', async (req, res) => {
  try {
    await prisma.subject.delete({ where: { id: req.params.id } });
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

// POST /api/subjects/:id/subtopics — add subtopic
router.post('/:id/subtopics', async (req, res) => {
  try {
    const { id: subtopicId, name, startDate, endDate, estimatedHours, notes, completed, order } = req.body;
    const subtopic = await prisma.subtopic.create({
      data: {
        id: subtopicId,
        name,
        subjectId: req.params.id,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        estimatedHours,
        notes,
        completed: completed ?? false,
        order: order ?? 0,
      },
    });
    res.status(201).json(subtopic);
  } catch (error) {
    console.error('Error creating subtopic:', error);
    res.status(500).json({ error: 'Failed to create subtopic' });
  }
});

// PUT /api/subjects/:subjectId/subtopics/:id — update subtopic
router.put('/:subjectId/subtopics/:id', async (req, res) => {
  try {
    const { name, startDate, endDate, estimatedHours, notes, completed, order } = req.body;
    const subtopic = await prisma.subtopic.update({
      where: { id: req.params.id },
      data: {
        name,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        estimatedHours,
        notes,
        completed,
        order,
      },
    });
    res.json(subtopic);
  } catch (error) {
    console.error('Error updating subtopic:', error);
    res.status(500).json({ error: 'Failed to update subtopic' });
  }
});

// DELETE /api/subjects/:subjectId/subtopics/:id — delete subtopic
router.delete('/:subjectId/subtopics/:id', async (req, res) => {
  try {
    await prisma.subtopic.delete({ where: { id: req.params.id } });
    res.json({ message: 'Subtopic deleted' });
  } catch (error) {
    console.error('Error deleting subtopic:', error);
    res.status(500).json({ error: 'Failed to delete subtopic' });
  }
});

export default router;
