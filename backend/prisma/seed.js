import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const subjects = [
  { id: 'subj-history-001', name: 'Indian History', color: '#f59e0b', icon: '📜', order: 0 },
  { id: 'subj-geography-001', name: 'Geography', color: '#84cc16', icon: '🌍', order: 1 },
  { id: 'subj-polity-001', name: 'Indian Polity', color: '#38bdf8', icon: '⚖️', order: 2 },
  { id: 'subj-economy-001', name: 'Economy', color: '#a78bfa', icon: '💰', order: 3 },
  { id: 'subj-science-001', name: 'Science & Tech', color: '#fb923c', icon: '🔬', order: 4 },
  { id: 'subj-ethics-001', name: 'Ethics', color: '#f472b6', icon: '🧭', order: 5 },
  { id: 'subj-essay-001', name: 'Essay', color: '#a3866a', icon: '✍️', order: 6 },
  { id: 'subj-csat-001', name: 'CSAT', color: '#2dd4bf', icon: '🧠', order: 7 },
  { id: 'subj-current-affairs-001', name: 'Current Affairs', color: '#f87171', icon: '📰', order: 8 },
  { id: 'subj-revision-001', name: 'Revision', color: '#6366f1', icon: '🔁', order: 9 },
  { id: 'subj-grouped-001', name: 'Grouped', color: '#ec4899', icon: '📚', order: 10 },
  { id: 'subj-answer-writing-001', name: 'Answer Writing', color: '#14b8a6', icon: '📝', order: 11 },
  { id: 'subj-test-001', name: 'Test', color: '#8b5cf6', icon: '✅', order: 12 },
  { id: 'subj-other-001', name: 'Other', color: '#9ca3af', icon: '✨', order: 13 },
];

async function main() {
  console.log('🌱 Seeding subjects...');

  await prisma.$transaction(
    subjects.map((subject) =>
      prisma.subject.upsert({
        where: { id: subject.id },
        update: {
          name: subject.name,
          color: subject.color,
          icon: subject.icon,
          order: subject.order,
        },
        create: subject,
      })
    )
  );

  console.log(`✅ Seeded ${subjects.length} subjects successfully.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
