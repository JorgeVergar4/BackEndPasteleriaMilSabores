require('dotenv').config();
const { supabase } = require('./config/supabase');

const main = async () => {
  try {
    const { data, error } = await supabase.from('categories').select('id, name').limit(5);

    if (error) throw error;

    console.log('✅ Conexión OK. Categorías de ejemplo:');
    console.table(data);
  } catch (err) {
    console.error('❌ Error en test-connection:', err);
  }
};

main();
