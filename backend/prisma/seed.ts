import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('LocalDev123!', 10);

  const [andre, sofia, mateo] = await Promise.all(
    [
      { email: 'andre@example.local', name: 'Andre' },
      { email: 'sofia@example.local', name: 'Sofia' },
      { email: 'mateo@example.local', name: 'Mateo' },
    ].map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name },
        create: { ...user, passwordHash },
      }),
    ),
  );

  const productChat = await prisma.chat.upsert({
    where: { id: 'seed-chat-product' },
    update: {},
    create: {
      id: 'seed-chat-product',
      name: 'Producto Sprint 1',
      ownerId: andre.id,
      members: {
        create: [
          { userId: andre.id, role: 'owner' },
          { userId: sofia.id, role: 'member' },
        ],
      },
    },
  });

  await prisma.chat.upsert({
    where: { id: 'seed-chat-research' },
    update: {},
    create: {
      id: 'seed-chat-research',
      name: 'Investigacion de agentes',
      ownerId: sofia.id,
      members: {
        create: [
          { userId: sofia.id, role: 'owner' },
          { userId: mateo.id, role: 'member' },
        ],
      },
    },
  });

  const assistant = await prisma.agent.upsert({
    where: {
      chatId_mentionHandle: {
        chatId: productChat.id,
        mentionHandle: 'planner',
      },
    },
    update: {},
    create: {
      chatId: productChat.id,
      creatorId: andre.id,
      name: 'Sprint Planner',
      description: 'Agente de ejemplo para planificacion local.',
      mentionHandle: 'planner',
      provider: 'mock',
      systemPrompt: 'Ayuda a organizar tareas del sprint.',
      llmConfig: { model: 'mock', temperature: 0.2 },
    },
  });

  await prisma.chatAgentLink.upsert({
    where: {
      chatId_agentId: { chatId: productChat.id, agentId: assistant.id },
    },
    update: {},
    create: { chatId: productChat.id, agentId: assistant.id },
  });
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
