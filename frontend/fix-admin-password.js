/**
 * Script para corrigir/atualizar a senha do usuário admin
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

async function fixAdminPassword() {
  console.log('============================================================');
  console.log('🔐 CORRIGINDO SENHA DO USUÁRIO ADMIN');
  console.log('============================================================\n');

  try {
    // Verificar se DATABASE_URL está configurado
    if (!process.env.DATABASE_URL) {
      console.error('❌ ERRO: DATABASE_URL não encontrado no .env.local');
      console.log('   Verifique se o arquivo .env.local existe e tem DATABASE_URL configurado');
      return;
    }

    console.log('1️⃣  Gerando hash da senha "admin123"...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    console.log('   ✅ Hash gerado\n');

    console.log('2️⃣  Verificando se usuário existe...');
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@metacampaigns.com' },
    });

    if (existingUser) {
      console.log('   ✅ Usuário encontrado, atualizando senha...');
      
      const updated = await prisma.user.update({
        where: { email: 'admin@metacampaigns.com' },
        data: { password: hashedPassword },
      });

      console.log('   ✅ Senha atualizada com sucesso!\n');
    } else {
      console.log('   ℹ️  Usuário não encontrado, criando novo usuário...');
      
      const created = await prisma.user.create({
        data: {
          email: 'admin@metacampaigns.com',
          password: hashedPassword,
          name: 'Administrador',
        },
      });

      console.log('   ✅ Usuário criado com sucesso!\n');
    }

    console.log('3️⃣  Verificando senha...');
    const user = await prisma.user.findUnique({
      where: { email: 'admin@metacampaigns.com' },
    });

    const isValid = await bcrypt.compare('admin123', user.password);
    
    if (isValid) {
      console.log('   ✅ Senha verificada com sucesso!\n');
    } else {
      console.error('   ❌ ERRO: Senha não corresponde!\n');
      return;
    }

    console.log('============================================================');
    console.log('✅ CONCLUÍDO COM SUCESSO!');
    console.log('============================================================');
    console.log('📧 Email: admin@metacampaigns.com');
    console.log('🔑 Senha: admin123');
    console.log('============================================================\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPassword();
