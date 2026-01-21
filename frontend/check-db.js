import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Usuários:', users.length);
  users.forEach(u => console.log('  -', u.email));
  
  const campaigns = await prisma.campaign.findMany({ include: { metrics: true } });
  console.log('\nCampanhas:', campaigns.length);
  campaigns.forEach(c => console.log('  -', c.name, '(métricas:', c.metrics.length, ')'));
}

main().catch(console.error).finally(() => prisma.$disconnect());
