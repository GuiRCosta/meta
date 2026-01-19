#!/usr/bin/env node
/**
 * Script para buscar credenciais do Supabase via MCP
 * e atualizar o arquivo .env.local
 */
const fs = require('fs');
const path = require('path');

async function fetchSupabaseCredentials() {
  console.log('🔍 Tentando buscar credenciais do Supabase via MCP...');
  
  // URL do projeto encontrada no CHECKLIST
  const projectUrl = 'https://dqwefmgqdfzgtmahsvds.supabase.co';
  const projectRef = 'dqwefmgqdfzgtmahsvds';
  
  console.log('📋 Projeto Supabase:', projectUrl);
  console.log('⚠️  Para usar o MCP do Supabase, você precisa:');
  console.log('   1. Ter o servidor MCP do Supabase configurado');
  console.log('   2. Ou buscar as credenciais manualmente no dashboard');
  console.log('');
  console.log('📝 Para buscar manualmente:');
  console.log(`   1. Acesse: https://supabase.com/dashboard/project/${projectRef}`);
  console.log('   2. Vá em Settings → Database');
  console.log('   3. Copie a Connection String (pooled)');
  console.log('   4. Vá em Settings → API');
  console.log('   5. Copie Project URL e anon key');
  console.log('');
  
  // Verificar se há um arquivo .env.local para atualizar
  const envPath = path.join(__dirname, '.env.local');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ Arquivo .env.local encontrado');
    console.log('💡 Use as instruções acima para atualizar as credenciais');
  } else {
    console.log('❌ Arquivo .env.local não encontrado');
  }
}

fetchSupabaseCredentials().catch(console.error);
