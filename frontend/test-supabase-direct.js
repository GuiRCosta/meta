#!/usr/bin/env node
/**
 * Teste direto do Supabase usando o cliente JavaScript
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  console.log('='.repeat(60));
  console.log('🧪 TESTE DIRETO DO SUPABASE');
  console.log('='.repeat(60));
  console.log();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('1️⃣  Verificando configuração...');
  
  if (!supabaseUrl || supabaseUrl.includes('PROJETO')) {
    console.log('   ❌ NEXT_PUBLIC_SUPABASE_URL não configurado ou tem valores de exemplo');
    console.log('   💡 Configure no arquivo .env.local');
    return;
  }
  
  if (!supabaseKey || supabaseKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')) {
    console.log('   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não configurado ou tem valores de exemplo');
    console.log('   💡 Configure no arquivo .env.local');
    return;
  }

  console.log('   ✅ Supabase URL:', supabaseUrl);
  console.log('   ✅ Anon Key:', supabaseKey.substring(0, 30) + '...');
  console.log();

  console.log('2️⃣  Criando cliente Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('   ✅ Cliente criado');
  console.log();

  console.log('3️⃣  Testando conexão...');
  try {
    // Tentar buscar uma tabela simples
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(5);

    if (usersError) {
      console.log('   ❌ Erro ao buscar usuários:', usersError.message);
      console.log('   📋 Código:', usersError.code);
      
      if (usersError.code === 'PGRST116') {
        console.log('   💡 Tabela "users" não encontrada. Execute: npm run db:push');
      } else if (usersError.code === '42P01') {
        console.log('   💡 Schema não encontrado. Execute: npm run db:push');
      }
    } else {
      console.log('   ✅ Conexão funcionando!');
      console.log(`   📊 ${users?.length || 0} usuário(s) encontrado(s)`);
      if (users && users.length > 0) {
        users.forEach((user, idx) => {
          console.log(`      ${idx + 1}. ${user.email} (${user.name || 'Sem nome'})`);
        });
      }
    }
  } catch (error) {
    console.log('   ❌ Erro:', error.message);
  }
  console.log();

  console.log('4️⃣  Testando tabela campaigns...');
  try {
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, name, status, meta_id')
      .limit(5);

    if (campaignsError) {
      console.log('   ❌ Erro:', campaignsError.message);
    } else {
      console.log(`   ✅ ${campaigns?.length || 0} campanha(s) encontrada(s)`);
      if (campaigns && campaigns.length > 0) {
        campaigns.forEach((camp, idx) => {
          console.log(`      ${idx + 1}. ${camp.name} (${camp.status})`);
        });
      }
    }
  } catch (error) {
    console.log('   ❌ Erro:', error.message);
  }
  console.log();

  console.log('='.repeat(60));
  console.log('✅ TESTE CONCLUÍDO');
  console.log('='.repeat(60));
}

testSupabase().catch(console.error);
