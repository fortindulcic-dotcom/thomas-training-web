import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
  );

  const hoy = new Date().toISOString().split('T')[0];
  const en5dias = new Date(); en5dias.setDate(en5dias.getDate() + 5);
  const en5diasStr = en5dias.toISOString().split('T')[0];
  const hace30dias = new Date(); hace30dias.setDate(hace30dias.getDate() - 30);
  const hace30diasStr = hace30dias.toISOString().split('T')[0];

  const { data: porVencer } = await supabase
    .from('rutinas')
    .select('id')
    .gte('fecha_vencimiento', hoy)
    .lte('fecha_vencimiento', en5diasStr)
    .eq('estado', 'activa');

  const { data: vencidos } = await supabase
    .from('rutinas')
    .select('id')
    .lt('fecha_vencimiento', hace30diasStr)
    .eq('estado', 'activa');

  return res.status(200).json({
    success: true,
    porVencerPendientes: porVencer?.length || 0,
    vencidosPendientes: vencidos?.length || 0,
    fecha: hoy
  });
}