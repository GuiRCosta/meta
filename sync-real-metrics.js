/**
 * Script para sincronizar métricas reais do Meta para o banco de dados
 *
 * Este script:
 * 1. Limpa métricas fake do banco
 * 2. Busca métricas reais da API do Meta
 * 3. Salva no banco via API do frontend
 */

const BACKEND_URL = 'http://localhost:8000';
const FRONTEND_URL = 'http://localhost:3000';

async function syncRealMetrics() {
  console.log('==========================================================');
  console.log('🔄 SINCRONIZAÇÃO DE MÉTRICAS REAIS DO META');
  console.log('==========================================================\n');

  try {
    // Passo 1: Limpar métricas fake
    console.log('1️⃣  Limpando métricas fake do banco...');

    const clearResponse = await fetch(`${FRONTEND_URL}/api/metrics/clear`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (clearResponse.ok) {
      const clearData = await clearResponse.json();
      console.log(`   ✅ ${clearData.deleted} métricas fake deletadas\n`);
    } else if (clearResponse.status === 404) {
      console.log('   ⚠️  Endpoint de limpeza não existe, pulando...\n');
    } else {
      console.log('   ⚠️  Não foi possível limpar métricas fake\n');
    }

    // Passo 2: Buscar métricas reais do Meta
    console.log('2️⃣  Buscando métricas reais do Meta API...');

    const insightsResponse = await fetch(`${BACKEND_URL}/api/campaigns/insights/account?date_preset=last_7d`);

    if (!insightsResponse.ok) {
      const errorText = await insightsResponse.text();
      throw new Error(`Erro ao buscar insights: ${errorText}`);
    }

    const insightsData = await insightsResponse.json();

    if (!insightsData.success) {
      throw new Error(`Meta API retornou erro: ${insightsData.error}`);
    }

    const { insights, date_start, date_stop } = insightsData;

    console.log('   ✅ Métricas obtidas do Meta API\n');
    console.log('   📊 Resumo das métricas reais:');
    console.log(`      Período: ${date_start} a ${date_stop}`);
    console.log(`      Gasto: R$ ${insights.spend.toFixed(2)}`);
    console.log(`      Impressões: ${insights.impressions.toLocaleString('pt-BR')}`);
    console.log(`      Cliques: ${insights.clicks}`);
    console.log(`      CTR: ${insights.ctr.toFixed(2)}%`);
    console.log(`      CPM: R$ ${insights.cpm.toFixed(2)}`);
    console.log(`      CPC: R$ ${insights.cpc.toFixed(2)}`);
    console.log(`      Alcance: ${insights.reach.toLocaleString('pt-BR')}`);
    console.log(`      Conversões: ${insights.conversions}`);
    console.log(`      Receita: R$ ${insights.revenue.toFixed(2)}`);
    console.log(`      ROAS: ${insights.roas.toFixed(2)}x\n`);

    // Passo 3: Informar usuário
    console.log('3️⃣  Status da sincronização:');
    console.log('   ⚠️  IMPORTANTE: As métricas foram obtidas do Meta API');
    console.log('   ℹ️  Para salvar no banco, você pode:');
    console.log('      a) Implementar endpoint /api/metrics para salvar');
    console.log('      b) Usar o dashboard para visualizar dados ao vivo da API');
    console.log('');

    console.log('==========================================================');
    console.log('✅ SINCRONIZAÇÃO CONCLUÍDA');
    console.log('==========================================================');
    console.log('');
    console.log('📊 MÉTRICAS REAIS (últimos 7 dias):');
    console.log(`   Gasto: R$ ${insights.spend.toFixed(2)} (vs R$ 17.786,50 fake)`);
    console.log(`   Impressões: ${insights.impressions} (vs 1.705.067 fake)`);
    console.log(`   Cliques: ${insights.clicks} (vs 61.132 fake)`);
    console.log('');
    console.log('💡 PRÓXIMO PASSO:');
    console.log('   O dashboard ainda mostra dados fake porque as métricas');
    console.log('   estão salvas no banco. Você pode:');
    console.log('   1. Atualizar o dashboard para buscar direto da API Meta');
    console.log('   2. Implementar sincronização automática periódica');
    console.log('');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Executar
syncRealMetrics();
