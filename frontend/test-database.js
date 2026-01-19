#!/usr/bin/env node
/**
 * Script para testar conexão e estado do banco de dados
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function testDatabase() {
  console.log('='.repeat(60));
  console.log('🧪 TESTE DE BANCO DE DADOS');
  console.log('='.repeat(60));
  console.log();

  // 1. Verificar variáveis de ambiente
  console.log('1️⃣  Verificando variáveis de ambiente...');
  const dbUrl = process.env.DATABASE_URL;
  const hasDbUrl = !!dbUrl;
  
  if (!hasDbUrl) {
    console.log('   ❌ DATABASE_URL não encontrado!');
    console.log('   💡 Configure DATABASE_URL no arquivo .env.local');
    process.exit(1);
  }
  
  // Verificar se tem valores de exemplo
  const hasExampleValues = dbUrl.includes('PROJETO') || dbUrl.includes('SENHA');
  
  if (hasExampleValues) {
    console.log('   ⚠️  DATABASE_URL contém valores de exemplo (PROJETO/SENHA)');
    console.log('   💡 Substitua pelas credenciais reais do Supabase');
  } else {
    console.log('   ✅ DATABASE_URL configurado:', dbUrl.substring(0, 50) + '...');
  }
  console.log();

  // 2. Testar conexão
  console.log('2️⃣  Testando conexão com o banco...');
  try {
    await prisma.$connect();
    console.log('   ✅ Conexão estabelecida com sucesso!');
  } catch (error) {
    console.log('   ❌ Erro ao conectar:', error.message);
    if (error.code) console.log('   📋 Código:', error.code);
    
    if (hasExampleValues) {
      console.log('   💡 O erro provavelmente é porque DATABASE_URL tem valores de exemplo');
      console.log('   💡 Configure as credenciais reais do Supabase');
    }
    
    await prisma.$disconnect();
    process.exit(1);
  }
  console.log();

  // 3. Verificar tabelas
  console.log('3️⃣  Verificando tabelas...');
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const tableNames = tables.map(t => t.table_name);
    console.log(`   ✅ Encontradas ${tableNames.length} tabela(s):`);
    tableNames.forEach(name => console.log(`      - ${name}`));
  } catch (error) {
    console.log('   ⚠️  Erro ao listar tabelas:', error.message);
  }
  console.log();

  // 4. Contar registros
  console.log('4️⃣  Contando registros nas tabelas principais...');
  try {
    const [users, campaigns, adSets, ads, metrics, alerts] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.campaign.count().catch(() => 0),
      prisma.adSet.count().catch(() => 0),
      prisma.ad.count().catch(() => 0),
      prisma.campaignMetric.count().catch(() => 0),
      prisma.alert.count().catch(() => 0),
    ]);

    console.log('   📊 Estatísticas do banco:');
    console.log(`      - Usuários: ${users}`);
    console.log(`      - Campanhas: ${campaigns}`);
    console.log(`      - Ad Sets: ${adSets}`);
    console.log(`      - Ads: ${ads}`);
    console.log(`      - Métricas: ${metrics}`);
    console.log(`      - Alertas: ${alerts}`);
  } catch (error) {
    console.log('   ⚠️  Erro ao contar registros:', error.message);
  }
  console.log();

  // 5. Listar algumas campanhas
  console.log('5️⃣  Listando campanhas (últimas 5)...');
  try {
    const campaigns = await prisma.campaign.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        adSets: {
          select: { id: true },
        },
      },
    });

    if (campaigns.length === 0) {
      console.log('   ℹ️  Nenhuma campanha encontrada no banco');
      console.log('   💡 Execute a sincronização para buscar campanhas do Meta');
    } else {
      console.log(`   📋 ${campaigns.length} campanha(s) encontrada(s):`);
      campaigns.forEach((camp, idx) => {
        console.log(`      ${idx + 1}. ${camp.name} (${camp.status})`);
        console.log(`         ID: ${camp.id}`);
        console.log(`         Meta ID: ${camp.metaId}`);
        console.log(`         Ad Sets: ${camp.adSets.length}`);
      });
    }
  } catch (error) {
    console.log('   ⚠️  Erro ao listar campanhas:', error.message);
  }
  console.log();

  // 6. Verificar usuários
  console.log('6️⃣  Verificando usuários...');
  try {
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (users.length === 0) {
      console.log('   ℹ️  Nenhum usuário encontrado');
      console.log('   💡 Execute: npm run db:seed para criar usuário admin');
    } else {
      console.log(`   👥 ${users.length} usuário(s) encontrado(s):`);
      users.forEach((user, idx) => {
        console.log(`      ${idx + 1}. ${user.email} (${user.name || 'Sem nome'})`);
      });
    }
  } catch (error) {
    console.log('   ⚠️  Erro ao listar usuários:', error.message);
  }
  console.log();

  await prisma.$disconnect();
  
  console.log('='.repeat(60));
  console.log('✅ TESTE CONCLUÍDO');
  console.log('='.repeat(60));
}

testDatabase().catch(async (error) => {
  console.error('❌ Erro durante o teste:', error);
  await prisma.$disconnect();
  process.exit(1);
});
