import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.task.findMany({
    where: { owner: 'Vishal' },
    select: { title: true, subjectId: true }
  });
  console.log("Total tasks:", tasks.length);
  const noSubjectTasks = tasks.filter(t => !t.subjectId);
  console.log(`Tasks without subject (${noSubjectTasks.length}):`);
  for (const t of noSubjectTasks) {
    console.log(`- ${t.title}`);
  }
}
main().finally(() => prisma.$disconnect());
