require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Using anon key for now since RLS is disabled in the generated schema. 
// For production with RLS, you should use SUPABASE_SERVICE_ROLE_KEY.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY inside backend .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
