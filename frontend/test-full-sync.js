const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFullSync() {
  try {
    console.log('🔍 Testando sincronização completa...\n');

    // 1. Buscar usuário
    const user = await prisma.user.findFirst({
      where: { email: 'admin@meta.com' }
    });

    if (!user) {
      console.error('❌ Usuário não encontrado!');
      return;
    }

    console.log('✅ Usuário encontrado:', user.email);
    console.log('   ID:', user.id);
    console.log('');

    // 2. Simular busca de campanhas da Meta
    const backendUrl = 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/campaigns/?include_drafts=true&limit=3`);

    if (!response.ok) {
      console.error('❌ Erro do backend:', response.status);
      const text = await response.text();
      console.error('   Resposta:', text);
      return;
    }

    const metaData = await response.json();
    console.log('✅ Backend respondeu com sucesso');
    console.log('   Campanhas encontradas:', metaData.total);
    console.log('');

    // 3. Tentar sincronizar primeira campanha
    if (metaData.campaigns && metaData.campaigns.length > 0) {
      const campaign = metaData.campaigns[0];
      console.log('📝 Sincronizando campanha:', campaign.name);

      const created = await prisma.campaign.upsert({
        where: { metaId: campaign.id },
        update: {
          name: campaign.name,
          status: 'PAUSED',
          objective: campaign.objective || 'UNKNOWN',
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          metaId: campaign.id,
          name: campaign.name,
          status: 'PAUSED',
          objective: campaign.objective || 'UNKNOWN',
        },
      });

      console.log('✅ Campanha sincronizada:', created.id);
      console.log('');
    }

    // 4. Contar campanhas no banco
    const count = await prisma.campaign.count({
      where: { userId: user.id }
    });

    console.log('📊 Total de campanhas no banco:', count);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testFullSync();
