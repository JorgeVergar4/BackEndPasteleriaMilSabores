const { createClient } = require('@supabase/supabase-js');

// Validar variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.error('   Asegúrate de tener SUPABASE_URL y SUPABASE_ANON_KEY en tu .env o en Vercel');
  throw new Error('Configuración de Supabase incompleta');
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

// Verificar conexión (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  console.log('✅ Cliente de Supabase inicializado');
  console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
}

module.exports = { supabase };
