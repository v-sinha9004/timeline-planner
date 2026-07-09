import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const id = '03c8ad6e-2dfa-4209-affd-8f07ca527b01'; // or any id
    // Just find any task to test with
    const anyTask = await prisma.task.findFirst();
    if (!anyTask) return console.log('No tasks found');
    console.log('Testing with task:', anyTask.id);
    
    const taskData = { completedDates: ["2026-07-09"] };
    const date = undefined;
    const startDate = undefined;
    const endDate = undefined;

    const task = await prisma.task.update({
      where: { id: anyTask.id },
      data: {
        ...taskData,
        date: date ? new Date(date) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    console.log('Success:', task);
  } catch (error) {
    console.error('Error updating task:', error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
