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

async function signInWithGoogle(volverA) {
  // En localhost, location.origin ya es la raíz del sitio (http://localhost:PUERTO).
  // En GitHub Pages, el sitio vive en /News/ (repo "News" del usuario "yangitart"),
  // así que hay que agregar ese segmento o el redirect cae fuera de la whitelist.
  const base = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? location.origin
    : `${location.origin}/News`;

  // Por defecto vuelve a la misma página (con su query string, ej. ?id=0002),
  // así sirve igual para el admin que para cualquier visitante que inicia
  // sesión desde una entrada para comentar o dar like.
  const pagina = volverA || (location.pathname.split('/').pop() + location.search);

  const { error } = await _sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${base}/${pagina}` }
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

/* ---- Comentarios (cualquier usuario logueado, no solo admin) ---- */

async function fetchComentarios(entradaId) {
  const { data, error } = await _sb
    .from('comentarios')
    .select('*')
    .eq('entrada_id', entradaId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

async function addComentario(entradaId, texto) {
  const user = await getUser();
  if (!user) throw new Error('Inicia sesión para comentar.');
  const meta = user.user_metadata || {};
  const { data, error } = await _sb
    .from('comentarios')
    .insert({
      entrada_id:  entradaId,
      user_id:     user.id,
      user_email:  user.email,
      user_name:   meta.full_name || meta.name || user.email,
      user_avatar: meta.avatar_url || meta.picture || null,
      contenido:   texto
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteComentario(id) {
  const { error } = await _sb.from('comentarios').delete().eq('id', id);
  if (error) throw error;
}

/* ---- Likes (cualquier usuario logueado, no solo admin) ---- */

async function fetchLikesCount(entradaId) {
  const { count, error } = await _sb
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('entrada_id', entradaId);
  if (error) throw error;
  return count || 0;
}

async function fetchMiLike(entradaId) {
  const user = await getUser();
  if (!user) return false;
  const { data, error } = await _sb
    .from('likes')
    .select('entrada_id')
    .eq('entrada_id', entradaId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

async function toggleLike(entradaId) {
  const user = await getUser();
  if (!user) throw new Error('Inicia sesión para dar like.');
  const yaLeGusta = await fetchMiLike(entradaId);
  if (yaLeGusta) {
    const { error } = await _sb.from('likes').delete()
      .eq('entrada_id', entradaId).eq('user_id', user.id);
    if (error) throw error;
    return false;
  }
  const { error } = await _sb.from('likes').insert({ entrada_id: entradaId, user_id: user.id });
  if (error) throw error;
  return true;
}
