import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { createListSchema, updateListSchema } from '../schemas/list.schemas.js';

export const listsRouter = Router();
listsRouter.use(requireAuth);

listsRouter.get('/', async (req, res) => {
  const lists = await prisma.resourceList.findMany({ where: { userId: req.auth!.userId }, include: { _count: { select: { resources: true } } }, orderBy: { createdAt: 'desc' } });
  res.json({ lists });
});

listsRouter.post('/', async (req, res) => {
  const data = createListSchema.parse(req.body);
  const list = await prisma.resourceList.create({ data: { ...data, userId: req.auth!.userId } });
  res.status(201).json({ list });
});

listsRouter.patch('/:id', async (req, res) => {
  const exists = await prisma.resourceList.findFirst({ where: { id: req.params.id, userId: req.auth!.userId } });
  if (!exists) return res.status(404).json({ message: 'List not found' });
  const list = await prisma.resourceList.update({ where: { id: exists.id }, data: updateListSchema.parse(req.body) });
  res.json({ list });
});

listsRouter.delete('/:id', async (req, res) => {
  const result = await prisma.resourceList.deleteMany({ where: { id: req.params.id, userId: req.auth!.userId } });
  if (!result.count) return res.status(404).json({ message: 'List not found' });
  res.status(204).send();
});
