#!/usr/bin/env node

/**
 * Script para testar sincronização de campanhas
 */

const http = require('http');

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function test() {
  console.log('🔍 Testando sincronização de campanhas...\n');

  // 1. Testar login
  console.log('1️⃣ Fazendo login...');
  const loginResult = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/callback/credentials',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }, {
    email: 'admin@meta.com',
    password: 'admin123',
  });

  console.log('Status:', loginResult.status);
  console.log('Response:', JSON.stringify(loginResult.data, null, 2));
  console.log();

  // 2. Testar sync endpoint
  console.log('2️⃣ Testando endpoint de sincronização...');
  const syncResult = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/sync',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('Status:', syncResult.status);
  console.log('Response:', JSON.stringify(syncResult.data, null, 2));
  console.log();

  // 3. Verificar backend diretamente
  console.log('3️⃣ Testando backend Python diretamente...');
  const backendResult = await makeRequest({
    hostname: 'localhost',
    port: 8000,
    path: '/api/campaigns/?include_drafts=true&limit=1',
    method: 'GET',
  });

  console.log('Status:', backendResult.status);
  console.log('Campanhas encontradas:', backendResult.data.total || 0);
  console.log();

  console.log('✅ Teste concluído!');
}

test().catch(console.error);
