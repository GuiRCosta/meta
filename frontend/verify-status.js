import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando status das campanhas no banco...\n');

  // Total geral
  const total = await prisma.campaign.count();
  console.log(`📊 TOTAL NO BANCO: ${total} campanhas\n`);

  // Por status (detalhado)
  const statuses = await prisma.campaign.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  console.log('📈 CONTAGEM POR STATUS:');
  statuses.forEach(s => {
    console.log(`   ${s.status}: ${s._count._all} campanhas`);
  });

  // O que o frontend mostra (exclui ARCHIVED)
  const notArchived = await prisma.campaign.count({
    where: { status: { not: 'ARCHIVED' } }
  });

  console.log(`\n✅ FRONTEND MOSTRA: ${notArchived} campanhas`);
  console.log('   (exclui ARCHIVED por padrão)\n');

  // Verificar se há campanhas com status NULL ou inválido
  const invalidStatus = await prisma.campaign.findMany({
    where: {
      OR: [
        { status: null },
        { status: { notIn: ['ACTIVE', 'PAUSED', 'ARCHIVED'] } }
      ]
    },
    select: { id: true, name: true, status: true }
  });

  if (invalidStatus.length > 0) {
    console.log('⚠️  CAMPANHAS COM STATUS INVÁLIDO:');
    invalidStatus.forEach(c => {
      console.log(`   - ${c.name}: status = "${c.status}"`);
    });
  } else {
    console.log('✅ Todas as campanhas têm status válido (ACTIVE, PAUSED ou ARCHIVED)');
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎯 COMPARAÇÃO:');
  console.log('='.repeat(70));
  console.log(`Meta BM mostra: 164 campanhas (conforme screenshot)`);
  console.log(`Frontend mostra: ${notArchived} campanhas (não arquivadas)`);
  console.log(`Banco tem: ${total} campanhas no total`);
  console.log(`\nDiferença BM vs Frontend: ${notArchived - 164} campanhas`);
  console.log(`Diferença Banco vs Frontend: ${total - notArchived} campanhas (arquivadas)`);

  // Buscar campanhas que podem estar causando a diferença
  console.log('\n' + '='.repeat(70));
  console.log('🔍 INVESTIGANDO AS 4 CAMPANHAS DE DIFERENÇA...');
  console.log('='.repeat(70));

  // Verificar se há campanhas muito antigas
  const oldCampaigns = await prisma.campaign.findMany({
    where: {
      status: { not: 'ARCHIVED' },
      updatedAt: { lt: new Date('2024-01-01') }
    },
    select: { id: true, name: true, status: true, updatedAt: true }
  });

  if (oldCampaigns.length > 0) {
    console.log(`\n⏰ CAMPANHAS ANTIGAS (antes de 2024):`);
    console.log(`   Total: ${oldCampaigns.length} campanhas`);
    console.log(`   Podem estar deletadas no Meta mas ainda no banco local`);
  } else {
    console.log(`\n✅ Nenhuma campanha antiga encontrada`);
  }

  // Buscar por campanhas recém-criadas localmente
  const recentLocal = await prisma.campaign.findMany({
    where: {
      status: { not: 'ARCHIVED' },
      createdAt: { gte: new Date('2025-01-01') }
    },
    select: { id: true, name: true, metaId: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log(`\n📅 CAMPANHAS CRIADAS EM 2025+ (${recentLocal.length} total):`);
  if (recentLocal.length > 0) {
    recentLocal.forEach((c, i) => {
      const nameTrunc = c.name.length > 50 ? c.name.substring(0, 50) + '...' : c.name;
      console.log(`   ${i + 1}. ${nameTrunc}`);
      console.log(`      Meta ID: ${c.metaId || 'NULL (local)'}`);
      console.log(`      Status: ${c.status}`);
    });
  }

  // Conclusão
  console.log('\n' + '='.repeat(70));
  console.log('💡 POSSÍVEL CAUSA:');
  console.log('='.repeat(70));
  console.log(`\nO Meta BM mostra 164 campanhas.`);
  console.log(`O Frontend mostra ${notArchived} campanhas (168).`);
  console.log(`\nDiferença de ${notArchived - 164} campanhas pode ser:`);
  console.log(`  1. Campanhas deletadas no Meta mas ainda no banco local`);
  console.log(`  2. Filtro ativo no Meta BM (verificar filtros na UI)`);
  console.log(`  3. Campanhas em rascunho ou status não sincronizado`);
  console.log(`\nRecomendação: Sincronizar campanhas via botão no frontend.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
