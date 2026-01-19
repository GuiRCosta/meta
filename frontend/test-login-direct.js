/**
 * Teste direto do login - simulando o que NextAuth faz
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function testLogin() {
  console.log('🧪 TESTE DIRETO DE LOGIN\n');
  
  const email = 'admin@metacampaigns.com';
  const password = 'admin123';

  try {
    console.log('1️⃣  Buscando usuário...');
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('✅ Usuário encontrado:', user.email);
    console.log('   ID:', user.id);
    console.log('   Nome:', user.name || 'N/A');
    console.log('   Hash da senha:', user.password.substring(0, 20) + '...');

    console.log('\n2️⃣  Testando senha...');
    const isValid = await bcrypt.compare(password, user.password);
    
    if (isValid) {
      console.log('✅ SENHA VÁLIDA! Login deve funcionar.');
      console.log('\n📋 Dados que o NextAuth receberá:');
      console.log('   id:', user.id);
      console.log('   email:', user.email);
      console.log('   name:', user.name || 'N/A');
    } else {
      console.log('❌ SENHA INVÁLIDA! Login não vai funcionar.');
      console.log('   Verifique se a senha está correta no banco.');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
