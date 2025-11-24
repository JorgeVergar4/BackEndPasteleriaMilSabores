const { createClient } = require('@supabase/supabase-js');

// SOLO estas dos variables:
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

module.exports = { supabase };
