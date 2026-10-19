// api/cron/recordatorios.js
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  // Seguridad: Vercel enviará este token automáticamente
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
  );

  const hoy = new Date().toISOString().split('T')[0];
  
  const en5dias = new Date();
  en5dias.setDate(en5dias.getDate() + 5);
  const en5diasStr = en5dias.toISOString().split('T')[0];

  const hace30dias = new Date();
  hace30dias.setDate(hace30dias.getDate() - 30);
  const hace30diasStr = hace30dias.toISOString().split('T')[0];

  // 1. Buscar quiénes necesitan recordatorio HOY (no enviado hoy)
  const { data: porVencer, error: err1 } = await supabase
    .from('rutinas')
    .select('id')
    .gte('fecha_vencimiento', hoy)
    .lte('fecha_vencimiento', en5diasStr)
    .eq('estado', 'activa')
    .or(`recordatorio_por_vencer_enviado.is.null,recordatorio_por_vencer_enviado.lt.${hoy}`);

  const { data: vencidos, error: err2 } = await supabase
    .from('rutinas')
    .select('id')
    .lt('fecha_vencimiento', hace30diasStr)
    .eq('estado', 'activa')
    .or(`recordatorio_vencido_30d_enviado.is.null,recordatorio_vencido_30d_enviado.lt.${hoy}`);

  if (err1 || err2) {
    return res.status(500).json({ error: 'Error en la base de datos', err1, err2 });
  }

  return res.status(200).json({
    success: true,
    mensaje: 'Cron ejecutado correctamente',
    porVencerPendientes: porVencer?.length || 0,
    vencidosPendientes: vencidos?.length || 0,
    fecha: hoy
  });
};