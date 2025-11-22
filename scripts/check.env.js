// Script para verificar las variables de entorno
const fs = require('fs');
const path = require('path');

function checkEnvironment() {
    console.log('🔍 Verificando variables de entorno...\n');

    const requiredVars = [
        'REACT_APP_JSONBIN_BIN_ID',
        'REACT_APP_JSONBIN_API_KEY'
    ];

    const missingVars = [];

    requiredVars.forEach(varName => {
        if (!process.env[varName]) {
            missingVars.push(varName);
            console.log(`❌ ${varName}: NO configurada`);
        } else {
            console.log(`✅ ${varName}: Configurada`);
        }
    });

    if (missingVars.length > 0) {
        console.log('\n⚠️  Variables faltantes:', missingVars.join(', '));
        console.log('\n📝 Para configurar:');
        console.log('1. Crea un archivo .env en la raíz del proyecto');
        console.log('2. Agrega las variables:');
        missingVars.forEach(varName => {
            console.log(`   ${varName}=tu_valor_aqui`);
        });
        console.log('\n🚀 Para producción, configura estas variables en tu plataforma de hosting');
        process.exit(1);
    } else {
        console.log('\n🎉 ¡Todas las variables están configuradas!');
    }
}

checkEnvironment();