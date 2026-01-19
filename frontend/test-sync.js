/**
 * Script de teste para sincronização de campanhas Meta → Banco Local
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();
const BACKEND_URL = process.env.AGNO_API_URL || 'http://localhost:8000';

async function testSync() {
  console.log('============================================================');
  console.log('🔄 TESTE DE SINCRONIZAÇÃO META → BANCO LOCAL');
  console.log('============================================================\n');

  try {
    // 1. Buscar campanhas do backend (Meta API)
    console.log('1️⃣  Buscando campanhas do backend (Meta API)...');
    const backendResponse = await fetch(`${BACKEND_URL}/api/campaigns/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      throw new Error(`Backend retornou erro ${backendResponse.status}: ${errorText}`);
    }

    const metaData = await backendResponse.json();
    const campaigns = metaData.campaigns || [];

    console.log(`   ✅ Encontradas ${campaigns.length} campanhas na Meta API\n`);

    if (campaigns.length === 0) {
      console.log('   ℹ️  Nenhuma campanha para sincronizar');
      return;
    }

    // 2. Buscar usuário admin para associar as campanhas
    console.log('2️⃣  Buscando usuário admin...');
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@metacampaigns.com' },
    });

    if (!adminUser) {
      throw new Error('Usuário admin não encontrado no banco!');
    }

    console.log(`   ✅ Usuário encontrado: ${adminUser.email} (ID: ${adminUser.id})\n`);

    // 3. Sincronizar campanhas
    console.log('3️⃣  Sincronizando campanhas no banco local...\n');
    let synced = 0;
    let updated = 0;
    let created = 0;
    const errors = [];

    for (const metaCampaign of campaigns) {
      try {
        // Verificar se já existe
        const existing = await prisma.campaign.findUnique({
          where: { metaId: metaCampaign.id },
        });

        const campaignData = {
          name: metaCampaign.name,
          status: metaCampaign.status,
          objective: metaCampaign.objective || 'UNKNOWN',
          dailyBudget: metaCampaign.daily_budget 
            ? Math.round(parseInt(metaCampaign.daily_budget) / 100) 
            : null,
          lifetimeBudget: metaCampaign.lifetime_budget 
            ? Math.round(parseInt(metaCampaign.lifetime_budget) / 100) 
            : null,
          updatedAt: new Date(),
        };

        if (existing) {
          // Atualizar existente
          await prisma.campaign.update({
            where: { metaId: metaCampaign.id },
            data: campaignData,
          });
          updated++;
          console.log(`   ✅ Atualizada: ${metaCampaign.name} (${metaCampaign.status})`);
        } else {
          // Criar nova
          await prisma.campaign.create({
            data: {
              userId: adminUser.id,
              metaId: metaCampaign.id,
              ...campaignData,
            },
          });
          created++;
          console.log(`   ➕ Criada: ${metaCampaign.name} (${metaCampaign.status})`);
        }
        synced++;
      } catch (error) {
        const errorMsg = `❌ Erro ao sincronizar ${metaCampaign.name}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`   ${errorMsg}`);
      }
    }

    console.log('\n4️⃣  Verificando resultado...');
    const totalInDb = await prisma.campaign.count();
    const activeInDb = await prisma.campaign.count({ where: { status: 'ACTIVE' } });
    const pausedInDb = await prisma.campaign.count({ where: { status: 'PAUSED' } });

    console.log('\n============================================================');
    console.log('📊 RESULTADO DA SINCRONIZAÇÃO');
    console.log('============================================================');
    console.log(`✅ Campanhas sincronizadas: ${synced}/${campaigns.length}`);
    console.log(`   ➕ Criadas: ${created}`);
    console.log(`   🔄 Atualizadas: ${updated}`);
    if (errors.length > 0) {
      console.log(`   ❌ Erros: ${errors.length}`);
    }
    console.log(`\n📊 Total no banco: ${totalInDb} campanhas`);
    console.log(`   🟢 Ativas: ${activeInDb}`);
    console.log(`   ⏸️  Pausadas: ${pausedInDb}`);
    console.log('============================================================\n');

    if (errors.length > 0) {
      console.log('⚠️  ERROS ENCONTRADOS:');
      errors.forEach((err) => console.log(`   ${err}`));
      console.log('');
    }

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testSync();
