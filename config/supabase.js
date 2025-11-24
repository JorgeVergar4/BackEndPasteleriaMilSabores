const { createClient } = require('@supabase/supabase-js');

// Usar las variables correctas definidas en Vercel o .env
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

module.exports = { supabase };
