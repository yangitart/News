/* =========================================================================
   VITACORA — cliente Supabase (UMD global, sin bundler)
   Se carga DESPUÉS del script CDN de supabase en el <head>.
   ========================================================================= */

const SUPA_URL  = 'https://lctakbprkqfumhpdkedo.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdGFrYnBya3FmdW1ocGRrZWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1OTI3MzksImV4cCI6MjA5ODE2ODczOX0.D_zND8P3YwJRmabBcNrpKuHUpjer5rG12cEfZXDBieo';

/* El CDN expone window.supabase como objeto global */
const _sb = window.supabase.createClient(SUPA_URL, SUPA_ANON);

/* ---- Helpers de datos ---- */

async function fetchEntradas() {
  const { data, error } = await _sb
    .from('entradas')
    .select('*')
    .eq('publicado', true)
    .order('fecha', { ascending: false });
  if (error) throw error;
  return data;
}

async function fetchTemas() {
  const { data, error } = await _sb
    .from('temas')
    .select('*')
    .order('label');
  if (error) throw error;
  return data;
}

async function upsertEntrada(entrada) {
  const { data, error } = await _sb
    .from('entradas')
    .upsert(entrada, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteEntrada(id) {
  const { error } = await _sb.from('entradas').delete().eq('id', id);
  if (error) throw error;
}

/* ---- Auth helpers ---- */

async function signInWithGoogle() {
  const { error } = await _sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${location.origin}/admin.html` }
  });
  if (error) throw error;
}

async function sbSignOut() {
  const { error } = await _sb.auth.signOut();
  if (error) throw error;
}

async function getUser() {
  const { data: { user } } = await _sb.auth.getUser();
  return user;
}
