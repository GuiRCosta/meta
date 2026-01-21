import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Analisando discrepância de campanhas...\n');

  // Total no banco
  const totalCampaigns = await prisma.campaign.count();
  console.log(`📊 Total de campanhas no banco: ${totalCampaigns}`);

  // Por status
  const byStatus = await prisma.campaign.groupBy({
    by: ['status'],
    _count: true,
  });

  console.log('\n📈 Campanhas por status:');
  byStatus.forEach(s => {
    console.log(`  - ${s.status}: ${s._count}`);
  });

  // Campanhas não arquivadas (o que aparece na lista)
  const notArchived = await prisma.campaign.count({
    where: {
      status: { not: 'ARCHIVED' }
    }
  });
  console.log(`\n✅ Campanhas não arquivadas (mostradas na UI): ${notArchived}`);

  // Campanhas arquivadas
  const archived = await prisma.campaign.count({
    where: { status: 'ARCHIVED' }
  });
  console.log(`📦 Campanhas arquivadas (ocultas): ${archived}`);

  // Por usuário
  const byUser = await prisma.campaign.groupBy({
    by: ['userId'],
    _count: true,
  });

  console.log('\n👥 Campanhas por usuário:');
  for (const u of byUser) {
    const user = await prisma.user.findUnique({ where: { id: u.userId } });
    console.log(`  - ${user?.email || u.userId}: ${u._count}`);
  }

  // Campanhas com metaId null vs preenchido
  const allCampaigns = await prisma.campaign.findMany({
    select: { metaId: true }
  });
  const withMetaId = allCampaigns.filter(c => c.metaId !== null).length;
  const withoutMetaId = allCampaigns.filter(c => c.metaId === null).length;

  console.log('\n🔗 Campanhas por origem:');
  console.log(`  - Sincronizadas do Meta (com metaId): ${withMetaId}`);
  console.log(`  - Criadas localmente (sem metaId): ${withoutMetaId}`);

  // Campanhas duplicadas (mesmo nome)
  const duplicates = await prisma.$queryRaw`
    SELECT name, COUNT(*) as count
    FROM "campaigns"
    GROUP BY name
    HAVING COUNT(*) > 1
    ORDER BY count DESC
    LIMIT 10
  `;

  console.log('\n🔄 Campanhas com nomes duplicados:');
  if (duplicates.length > 0) {
    duplicates.forEach(d => {
      console.log(`  - "${d.name}": ${d.count} cópias`);
    });
  } else {
    console.log('  Nenhuma duplicata encontrada');
  }

  console.log('\n' + '='.repeat(60));
  console.log('💡 POSSÍVEIS CAUSAS DA DISCREPÂNCIA:');
  console.log('='.repeat(60));

  if (archived > 0) {
    console.log(`\n1. ✅ ARQUIVADAS: ${archived} campanhas estão arquivadas`);
    console.log('   → Frontend filtra arquivadas por padrão (status != ARCHIVED)');
    console.log(`   → UI mostra: ${notArchived} | Total no banco: ${totalCampaigns}`);
  }

  if (withoutMetaId > 0) {
    console.log(`\n2. 📝 LOCAIS: ${withoutMetaId} campanhas criadas localmente`);
    console.log('   → Essas campanhas não existem no Meta Business Manager');
    console.log('   → Aparecem no frontend mas não na BM');
  }

  if (duplicates.length > 0) {
    console.log(`\n3. 🔄 DUPLICADAS: ${duplicates.length} nomes com múltiplas cópias`);
    console.log('   → Podem ter sido criadas pela função "Duplicar"');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎯 CONCLUSÃO:');
  console.log('='.repeat(60));
  console.log(`Frontend UI: ${notArchived} campanhas (excluindo arquivadas)`);
  console.log(`Meta BM: Deve mostrar apenas campanhas com metaId válido`);
  console.log(`Total no banco: ${totalCampaigns} campanhas`);

  const expectedDiff = notArchived - withMetaId;
  if (expectedDiff > 0) {
    console.log(`\n⚠️  Diferença esperada: ${expectedDiff} campanhas`);
    console.log(`   → ${withoutMetaId} criadas localmente (sem metaId)`);
    console.log(`   → Essas NÃO aparecem na BM, só no frontend`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
