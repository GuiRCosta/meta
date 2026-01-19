import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ==========================================
  // 1. CRIAR USUÁRIO ADMIN
  // ==========================================
  console.log('👤 Criando usuário admin...');
  
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@metacampaigns.com' },
    update: {},
    create: {
      email: 'admin@metacampaigns.com',
      password: hashedPassword,
      name: 'Administrador',
      settings: {
        create: {
          monthlyBudgetLimit: 5000,
          alertAt50Percent: true,
          alertAt80Percent: true,
          alertAt100Percent: true,
          alertOnProjectedOverrun: true,
          whatsappEnabled: false,
          dailyReportTime: '18:00',
          sendDailyReports: true,
          sendImmediateAlerts: true,
          sendSuggestions: true,
          sendStatusChanges: true,
        },
      },
    },
  });

  console.log(`   ✅ Usuário criado: ${user.email}`);
  console.log(`   📧 Email: admin@metacampaigns.com`);
  console.log(`   🔑 Senha: admin123\n`);

  // ==========================================
  // 2. CRIAR CAMPANHAS DE EXEMPLO
  // ==========================================
  console.log('📢 Criando campanhas de exemplo...');

  const campaigns = [
    {
      metaId: 'meta_camp_001',
      name: 'E-commerce Janeiro 2026',
      objective: 'OUTCOME_SALES',
      status: 'ACTIVE',
      dailyBudget: 100,
    },
    {
      metaId: 'meta_camp_002',
      name: 'Leads Qualificados',
      objective: 'OUTCOME_LEADS',
      status: 'ACTIVE',
      dailyBudget: 50,
    },
    {
      metaId: 'meta_camp_003',
      name: 'Promo Verão',
      objective: 'OUTCOME_TRAFFIC',
      status: 'PAUSED',
      dailyBudget: 75,
    },
    {
      metaId: 'meta_camp_004',
      name: 'Brand Awareness',
      objective: 'OUTCOME_AWARENESS',
      status: 'ACTIVE',
      dailyBudget: 30,
    },
    {
      metaId: 'meta_camp_005',
      name: 'Engajamento Social',
      objective: 'OUTCOME_ENGAGEMENT',
      status: 'PAUSED',
      dailyBudget: 25,
    },
  ];

  for (const campaign of campaigns) {
    await prisma.campaign.upsert({
      where: { metaId: campaign.metaId },
      update: {},
      create: {
        ...campaign,
        userId: user.id,
        adSets: {
          create: [
            {
              metaId: `${campaign.metaId}_adset_001`,
              name: `Público Principal - ${campaign.name}`,
              status: campaign.status,
              dailyBudget: campaign.dailyBudget,
              targeting: {
                age_min: 25,
                age_max: 45,
                genders: [1, 2],
                geo_locations: { countries: ['BR'] },
              },
              ads: {
                create: [
                  {
                    metaId: `${campaign.metaId}_ad_001`,
                    name: `Anúncio Principal - ${campaign.name}`,
                    status: campaign.status,
                    creative: {
                      headline: 'Oferta Especial!',
                      primaryText: 'Aproveite nossas ofertas exclusivas',
                      description: 'Condições imperdíveis',
                      callToAction: 'SHOP_NOW',
                      linkUrl: 'https://example.com',
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });
    console.log(`   ✅ ${campaign.name}`);
  }

  console.log('');

  // ==========================================
  // 3. CRIAR MÉTRICAS DE EXEMPLO
  // ==========================================
  console.log('📊 Criando métricas de exemplo...');

  const allCampaigns = await prisma.campaign.findMany({
    where: { userId: user.id },
  });

  const today = new Date();
  
  for (const campaign of allCampaigns) {
    // Criar métricas dos últimos 7 dias
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const impressions = Math.floor(Math.random() * 5000) + 2000;
      const clicks = Math.floor(impressions * (Math.random() * 0.03 + 0.02)); // 2-5% CTR
      const spend = (campaign.dailyBudget || 50) * (Math.random() * 0.3 + 0.7); // 70-100% do budget
      const conversions = Math.floor(clicks * (Math.random() * 0.1 + 0.02)); // 2-12% conversion rate

      await prisma.campaignMetric.upsert({
        where: {
          campaignId_date: {
            campaignId: campaign.id,
            date: date,
          },
        },
        update: {},
        create: {
          campaignId: campaign.id,
          date: date,
          impressions,
          clicks,
          spend,
          conversions,
          reach: Math.floor(impressions * 0.8),
          cpc: spend / clicks,
          ctr: (clicks / impressions) * 100,
          cpm: (spend / impressions) * 1000,
          roas: conversions > 0 ? (conversions * 50) / spend : null, // Assumindo R$50 por conversão
        },
      });
    }
  }

  console.log(`   ✅ Métricas criadas para ${allCampaigns.length} campanhas\n`);

  // ==========================================
  // 4. CRIAR ALERTAS DE EXEMPLO
  // ==========================================
  console.log('🔔 Criando alertas de exemplo...');

  const alerts = [
    {
      type: 'warning',
      priority: 'high',
      title: 'CTR abaixo do esperado',
      message: 'A campanha "E-commerce Janeiro" está com CTR de 1.2%, abaixo do mínimo de 1.5%.',
      campaignId: allCampaigns[0]?.id,
      campaignName: 'E-commerce Janeiro 2026',
    },
    {
      type: 'warning',
      priority: 'medium',
      title: '80% do orçamento utilizado',
      message: 'Você já utilizou 80% do seu orçamento mensal (R$ 4.000 de R$ 5.000).',
    },
    {
      type: 'info',
      priority: 'low',
      title: 'Tendência negativa detectada',
      message: 'A campanha "Promo Verão" teve queda de 15% nas conversões esta semana.',
      campaignId: allCampaigns[2]?.id,
      campaignName: 'Promo Verão',
    },
  ];

  for (const alert of alerts) {
    await prisma.alert.create({
      data: {
        userId: user.id,
        ...alert,
      },
    });
    console.log(`   ✅ ${alert.title}`);
  }

  console.log('');

  // ==========================================
  // 5. CRIAR RESUMO MENSAL
  // ==========================================
  console.log('📅 Criando resumo mensal...');

  await prisma.monthlySummary.upsert({
    where: {
      userId_month_year: {
        userId: user.id,
        month: today.getMonth() + 1,
        year: today.getFullYear(),
      },
    },
    update: {},
    create: {
      userId: user.id,
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      totalSpend: 2350,
      totalImpressions: 125000,
      totalClicks: 3400,
      totalConversions: 89,
      avgCpc: 0.69,
      avgCtr: 2.72,
      avgRoas: 3.4,
    },
  });

  console.log(`   ✅ Resumo de ${today.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}\n`);

  // ==========================================
  // RESUMO FINAL
  // ==========================================
  console.log('═══════════════════════════════════════════');
  console.log('🎉 Seed concluído com sucesso!');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('📧 Login: admin@metacampaigns.com');
  console.log('🔑 Senha: admin123');
  console.log('');
  console.log('Dados criados:');
  console.log(`  • 1 usuário administrador`);
  console.log(`  • ${campaigns.length} campanhas de exemplo`);
  console.log(`  • ${campaigns.length * 7} registros de métricas`);
  console.log(`  • ${alerts.length} alertas de exemplo`);
  console.log(`  • 1 resumo mensal`);
  console.log('');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro durante o seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
