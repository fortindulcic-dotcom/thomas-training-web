import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Badge, Spinner, Table, Button, Modal, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import { supabase } from '../utils/supabase';

const COLORS = {
  primary: '#667eea', success: '#43e97b', warning: '#f5576c',
  info: '#4facfe', purple: '#764ba2', orange: '#f093fb',
  teal: '#38f9d7', dark: '#1a1f36'
};

const PLAN_COLORS = {
  'Principiante': '#4facfe', 'Intermedio': '#667eea',
  'Avanzado': '#764ba2', 'Rutinas Prediseñadas': '#f093fb'
};

const calcularTendencia = (datos) => {
  const n = datos.length;
  const sumX = datos.reduce((acc, _, i) => acc + i, 0);
  const sumY = datos.reduce((acc, d) => acc + d.clientes, 0);
  const sumXY = datos.reduce((acc, d, i) => acc + i * d.clientes, 0);
  const sumX2 = datos.reduce((acc, _, i) => acc + i * i, 0);
  const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const interseccion = (sumY - pendiente * sumX) / n;
  const meses = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];

  const datosConTendencia = datos.map((d, i) => ({
    ...d, tendencia: Math.max(0, Math.round(pendiente * i + interseccion))
  }));

  const proximosMeses = [];
  for (let i = 1; i <= 2; i++) {
    const proyeccion = Math.max(0, Math.round(pendiente * (n - 1 + i) + interseccion));
    const ultimoMes = datos[datos.length - 1];
    const mesIndex = (meses.indexOf(ultimoMes.mes) + i) % 12;
    proximosMeses.push({ mes: meses[mesIndex], etiqueta: `+${i}`, clientes: null, tendencia: proyeccion });
  }
  return [...datosConTendencia, ...proximosMeses];
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    clientesTotales: 0, clientesMes: 0,
    pagosMes: { total: 0, confirmados: 0, pendientes: 0 },
    rutinasMes: { total: 0, activas: 0, borradores: 0 },
    tasaRenovacion: 0, porVencer: [], vencidos: []
  });
  const [datosMensuales, setDatosMensuales] = useState([]);
  const [clientesPorPlan, setClientesPorPlan] = useState([]);
  const [ultimosClientes, setUltimosClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [esMovil, setEsMovil] = useState(false);

  // Estados para envío
  const [enviandoMasivo, setEnviandoMasivo] = useState(null);
  const [progresoEnvio, setProgresoEnvio] = useState({ actual: 0, total: 0 });
  const [mostrarModalEnvio, setMostrarModalEnvio] = useState(false);

  useEffect(() => {
    const checkMovil = () => setEsMovil(window.innerWidth < 768);
    checkMovil();
    window.addEventListener('resize', checkMovil);
    return () => window.removeEventListener('resize', checkMovil);
  }, []);

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarTodo = async () => {
    setCargando(true);
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();
    
    const en5dias = new Date(hoy); en5dias.setDate(en5dias.getDate() + 5);
    const en5diasStr = en5dias.toISOString().split('T')[0];
    const hace30dias = new Date(hoy); hace30dias.setDate(hace30dias.getDate() - 30);
    const hace30diasStr = hace30dias.toISOString().split('T')[0];

    const { count: totalClientes } = await supabase.from('clientes').select('*', { count: 'exact', head: true }).eq('estado_pago', 'pagado');
    const { count: clientesMes } = await supabase.from('clientes').select('*', { count: 'exact', head: true }).eq('estado_pago', 'pagado').gte('created_at', primerDiaMes);
    const { data: pagosMes } = await supabase.from('clientes').select('pago_verificado').gte('created_at', primerDiaMes);
    const pagosConfirmados = (pagosMes || []).filter(p => p.pago_verificado).length;
    const pagosPendientes = (pagosMes || []).filter(p => !p.pago_verificado).length;

    const { data: rutinasMes } = await supabase.from('rutinas').select('estado').gte('created_at', primerDiaMes);
    const rutinasActivas = (rutinasMes || []).filter(r => r.estado === 'activa').length;
    const rutinasBorrador = (rutinasMes || []).filter(r => r.estado === 'borrador').length;

    const { data: todosClientes } = await supabase.from('clientes').select('es_renovacion, nivel_experiencia, tipo_producto, created_at').eq('estado_pago', 'pagado');
    const totalRenovaciones = (todosClientes || []).filter(c => c.es_renovacion).length;
    const totalNuevos = (todosClientes || []).filter(c => !c.es_renovacion).length;
    const tasaRenovacion = totalNuevos > 0 ? ((totalRenovaciones / totalNuevos) * 100).toFixed(0) : 0;

    // CONSULTAS CORREGIDAS
    const { data: porVencerData } = await supabase
      .from('rutinas')
      .select('id, fecha_vencimiento, token, recordatorio_por_vencer_enviado, cliente_id')
      .gte('fecha_vencimiento', hoyStr)
      .lte('fecha_vencimiento', en5diasStr)
      .eq('estado', 'activa')
      .order('fecha_vencimiento', { ascending: true });

    const { data: vencidosData } = await supabase
      .from('rutinas')
      .select('id, fecha_vencimiento, token, recordatorio_vencido_30d_enviado, cliente_id')
      .lt('fecha_vencimiento', hoyStr)
      .eq('estado', 'activa')
      .order('fecha_vencimiento', { ascending: false });

    // Obtener datos de clientes por separado
    const clienteIds = [
      ...(porVencerData || []).map(r => r.cliente_id),
      ...(vencidosData || []).map(r => r.cliente_id)
    ].filter(Boolean);

    let clientesMap = {};
    if (clienteIds.length > 0) {
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('id, nombre, telefono, email')
        .in('id', [...new Set(clienteIds)]);
      
      (clientesData || []).forEach(c => { clientesMap[c.id] = c; });
    }

    const porVencerFiltrados = (porVencerData || []).map(r => {
      const env = r.recordatorio_por_vencer_enviado;
      const enviadoHoy = env && new Date(env).toISOString().split('T')[0] === hoyStr;
      return { ...r, clientes: clientesMap[r.cliente_id], enviadoHoy };
    });

    const vencidosFiltrados = (vencidosData || []).filter(r => {
      const fechaVenc = new Date(r.fecha_vencimiento);
      return fechaVenc <= hace30dias;
    }).map(r => {
      const env = r.recordatorio_vencido_30d_enviado;
      const enviadoHoy = env && new Date(env).toISOString().split('T')[0] === hoyStr;
      return { ...r, clientes: clientesMap[r.cliente_id], enviadoHoy };
    });

    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const datos12Meses = [];
    const fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 11, 1);
    for (let i = 0; i < 12; i++) {
      const fecha = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth() + i, 1);
      const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59);
      const clientesMes = (todosClientes || []).filter(c => {
        const f = new Date(c.created_at);
        return f >= fecha && f <= finMes;
      });
      datos12Meses.push({ mes: meses[fecha.getMonth()], año: fecha.getFullYear(), clientes: clientesMes.length, etiqueta: `${meses[fecha.getMonth()]} ${String(fecha.getFullYear()).slice(-2)}` });
    }
    const datosConTendencia = calcularTendencia(datos12Meses);

    const planesCount = {};
    (todosClientes || []).forEach(c => {
      const plan = c.tipo_producto === 'rutina_prediseñada' ? 'Rutinas Prediseñadas' : c.nivel_experiencia;
      planesCount[plan] = (planesCount[plan] || 0) + 1;
    });
    const distribucionPlanes = Object.keys(planesCount).map(plan => ({ name: plan, value: planesCount[plan] }));

    const { data: recientes } = await supabase.from('clientes').select('*').eq('estado_pago', 'pagado').order('created_at', { ascending: false }).limit(5);

    setStats({
      clientesTotales: totalClientes || 0, clientesMes: clientesMes || 0,
      pagosMes: { total: (pagosMes || []).length, confirmados: pagosConfirmados, pendientes: pagosPendientes },
      rutinasMes: { total: (rutinasMes || []).length, activas: rutinasActivas, borradores: rutinasBorrador },
      tasaRenovacion: parseInt(tasaRenovacion),
      porVencer: porVencerFiltrados, vencidos: vencidosFiltrados
    });
    setDatosMensuales(datosConTendencia);
    setClientesPorPlan(distribucionPlanes);
    setUltimosClientes(recientes || []);
    setCargando(false);
  };

  const enviarMasivo = async (tipo) => {
    const lista = tipo === 'por_vencer' ? stats.porVencer : stats.vencidos;
    const pendientes = lista.filter(r => !r.enviadoHoy);
    
    if (pendientes.length === 0) {
      alert('Todos los clientes de esta lista ya recibieron su mensaje hoy.');
      return;
    }

    setEnviandoMasivo(tipo);
    setProgresoEnvio({ actual: 0, total: pendientes.length });
    setMostrarModalEnvio(true);

    const campo = tipo === 'por_vencer' ? 'recordatorio_por_vencer_enviado' : 'recordatorio_vencido_30d_enviado';

    for (let i = 0; i < pendientes.length; i++) {
      const rutina = pendientes[i];
      const cliente = rutina.clientes;
      if (!cliente) continue;

      const mensaje = tipo === 'por_vencer'
        ? `¡Hola ${cliente.nombre}! 💪\n\nTu plan de entrenamiento vence el ${new Date(rutina.fecha_vencimiento).toLocaleDateString('es-CL')}.\n\nRenueva directamente aquí: ${window.location.origin}/renovar/${rutina.token}\n\n¡Vamos con todo! 🔥`
        : `¡Hola ${cliente.nombre}! 👋\n\nHan pasado 30 días desde que venció tu plan.\n\n¿Quieres retomar? Escríbeme por aquí. 💪`;

      const telefono = cliente.telefono.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');

      await supabase.from('rutinas').update({ [campo]: new Date().toISOString() }).eq('id', rutina.id);
      setProgresoEnvio({ actual: i + 1, total: pendientes.length });

      if (i < pendientes.length - 1) await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setEnviandoMasivo(null);
    setTimeout(() => { setMostrarModalEnvio(false); cargarTodo(); }, 1500);
  };

  if (cargando) {
    return <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-3 text-muted">Cargando...</p></div>;
  }

  const porcentajePagos = stats.pagosMes.total > 0 ? Math.round((stats.pagosMes.confirmados / stats.pagosMes.total) * 100) : 0;
  const datosPagosDona = [{ name: 'Confirmados', value: stats.pagosMes.confirmados, color: COLORS.success }, { name: 'Pendientes', value: stats.pagosMes.pendientes, color: COLORS.warning }];
  const datosRutinasDona = [{ name: 'Activas', value: stats.rutinasMes.activas, color: COLORS.success }, { name: 'Borradores', value: stats.rutinasMes.borradores, color: COLORS.warning }];

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div><h4 className="fw-bold mb-1">Bienvenido, Thomas 👋</h4><p className="text-muted mb-0 small">Resumen de tu negocio hoy.</p></div>
        <Badge bg="success" className="p-2">● Sistema activo</Badge>
      </div>

      {/* KPIs */}
      <Row className="g-3 mb-4">
        <Col xs={6} lg={2}><Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}><Card.Body className="p-3"><p className="mb-1 opacity-75 small">Clientes</p><h4 className="fw-bold mb-0">{stats.clientesTotales}</h4><small className="opacity-75">+{stats.clientesMes}</small></Card.Body></Card></Col>
        <Col xs={6} lg={2}><Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}><Card.Body className="p-3"><p className="mb-1 opacity-75 small">Pagos</p><h4 className="fw-bold mb-0">{stats.pagosMes.confirmados}/{stats.pagosMes.total}</h4><small className="opacity-75">{porcentajePagos}%</small></Card.Body></Card></Col>
        <Col xs={6} lg={2}><Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}><Card.Body className="p-3"><p className="mb-1 opacity-75 small">Rutinas</p><h4 className="fw-bold mb-0">{stats.rutinasMes.activas}/{stats.rutinasMes.total}</h4><small className="opacity-75">{stats.rutinasMes.borradores} borr.</small></Card.Body></Card></Col>
        <Col xs={6} lg={2}><Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}><Card.Body className="p-3"><p className="mb-1 opacity-75 small">Renovación</p><h4 className="fw-bold mb-0">{stats.tasaRenovacion}%</h4><small className="opacity-75">vuelven</small></Card.Body></Card></Col>
        <Col xs={6} lg={2}><Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', color: 'white' }}><Card.Body className="p-3"><p className="mb-1 opacity-75 small">🔄 Por Vencer</p><h4 className="fw-bold mb-0">{stats.porVencer.length}</h4><small className="opacity-75">≤5 días</small></Card.Body></Card></Col>
        <Col xs={6} lg={2}><Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)', color: 'white' }}><Card.Body className="p-3"><p className="mb-1 opacity-75 small">⚠️ Vencidos</p><h4 className="fw-bold mb-0">{stats.vencidos.length}</h4><small className="opacity-75">+30 días</small></Card.Body></Card></Col>
      </Row>

      {/* Gráfico Principal */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <div className="mb-3"><h6 className="fw-bold mb-0">📊 Clientes Nuevos por Mes</h6></div>
          <ResponsiveContainer width="100%" height={esMovil ? 250 : 320}>
            <ComposedChart data={datosMensuales} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="etiqueta" tick={{ fontSize: esMovil ? 9 : 12 }} angle={esMovil ? -45 : 0} textAnchor={esMovil ? 'end' : 'middle'} height={esMovil ? 50 : 30} />
              <YAxis tick={{ fontSize: esMovil ? 10 : 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="clientes" name="Clientes" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
              <Line type="monotone" dataKey="tendencia" name="Tendencia" stroke={COLORS.warning} strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3, fill: COLORS.warning }} connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      {/* Donas */}
      <Row className="g-3 mb-4">
        <Col xs={12} md={4}><Card className="border-0 shadow-sm h-100"><Card.Body className="p-3"><h6 className="fw-bold mb-3">💰 Pagos</h6><div style={{ position: 'relative' }}><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={datosPagosDona} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">{datosPagosDona.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}><div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1f36' }}>{stats.pagosMes.total}</div><small className="text-muted">Total</small></div></div><div className="d-flex justify-content-around mt-2"><div className="text-center"><Badge bg="success">{stats.pagosMes.confirmados}</Badge><br /><small>Confirmados</small></div><div className="text-center"><Badge bg="warning" text="dark">{stats.pagosMes.pendientes}</Badge><br /><small>Pendientes</small></div></div></Card.Body></Card></Col>
        <Col xs={12} md={4}><Card className="border-0 shadow-sm h-100"><Card.Body className="p-3"><h6 className="fw-bold mb-3">📝 Rutinas</h6><div style={{ position: 'relative' }}><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={datosRutinasDona} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">{datosRutinasDona.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}><div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1f36' }}>{stats.rutinasMes.total}</div><small className="text-muted">Total</small></div></div><div className="d-flex justify-content-around mt-2"><div className="text-center"><Badge bg="success">{stats.rutinasMes.activas}</Badge><br /><small>Activas</small></div><div className="text-center"><Badge bg="warning" text="dark">{stats.rutinasMes.borradores}</Badge><br /><small>Borradores</small></div></div></Card.Body></Card></Col>
        <Col xs={12} md={4}><Card className="border-0 shadow-sm h-100"><Card.Body className="p-3"><h6 className="fw-bold mb-3">🎯 Clientes por Plan</h6><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={clientesPorPlan} cx="50%" cy="50%" outerRadius={75} paddingAngle={3} dataKey="value">{clientesPorPlan.map((e, i) => <Cell key={i} fill={PLAN_COLORS[e.name] || COLORS.primary} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="mt-2">{clientesPorPlan.map(p => <div key={p.name} className="d-flex justify-content-between small mb-1"><span><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', backgroundColor: PLAN_COLORS[p.name], marginRight: '8px' }}></span>{p.name}</span><strong>{p.value}</strong></div>)}</div></Card.Body></Card></Col>
      </Row>

      {/* Alertas */}
      <Row className="g-3 mb-4">
        {stats.pagosMes.pendientes > 0 && (
          <Col xs={12} md={4}><Card className="border-0 shadow-sm h-100" style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107' }}><Card.Body className="p-3"><h6 className="fw-bold mb-2">⚠️ Atención Requerida</h6><p className="small text-muted mb-2">Tienes {stats.pagosMes.pendientes} pago(s) por verificar.</p><Button as={Link} to="/admin/pagos-pendientes" variant="warning" size="sm" className="w-100">Revisar pagos</Button></Card.Body></Card></Col>
        )}
        {stats.porVencer.length > 0 && (
          <Col xs={12} md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ background: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between mb-2"><h6 className="fw-bold mb-0">🔄 Por Vencer</h6><Badge bg="warning" text="dark">{stats.porVencer.length}</Badge></div>
                <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '8px' }}>
                  {stats.porVencer.map(r => (
                    <div key={r.id} className="d-flex justify-content-between small mb-1">
                      <span className="text-truncate me-2">{r.clientes?.nombre}</span>
                      {r.enviadoHoy ? <Badge bg="success">✅</Badge> : <Badge bg="secondary">Pendiente</Badge>}
                    </div>
                  ))}
                </div>
                <Button variant="warning" size="sm" className="w-100" onClick={() => enviarMasivo('por_vencer')} disabled={enviandoMasivo !== null}>
                  📩 Enviar recordatorios de hoy
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
        {stats.vencidos.length > 0 && (
          <Col xs={12} md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ background: '#ffe6e6', borderLeft: '4px solid #f5576c' }}>
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between mb-2"><h6 className="fw-bold mb-0">⚠️ Vencidos +30d</h6><Badge bg="danger">{stats.vencidos.length}</Badge></div>
                <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '8px' }}>
                  {stats.vencidos.map(r => (
                    <div key={r.id} className="d-flex justify-content-between small mb-1">
                      <span className="text-truncate me-2">{r.clientes?.nombre}</span>
                      {r.enviadoHoy ? <Badge bg="success">✅</Badge> : <Badge bg="secondary">Pendiente</Badge>}
                    </div>
                  ))}
                </div>
                <Button variant="danger" size="sm" className="w-100" onClick={() => enviarMasivo('vencidos')} disabled={enviandoMasivo !== null}>
                  📩 Enviar campaña de recuperación
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Últimos Clientes */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3"><h6 className="fw-bold mb-0">🕐 Últimos Clientes</h6><Button as={Link} to="/admin/clientes" variant="link" size="sm" className="p-0">Ver todos →</Button></div>
          {ultimosClientes.length === 0 ? <p className="text-muted text-center py-4">No hay clientes.</p> : esMovil ? (
            <div>{ultimosClientes.map(c => <div key={c.id} className="border-bottom py-2"><div className="d-flex justify-content-between"><div><strong>{c.nombre}</strong><br /><small>{new Date(c.created_at).toLocaleDateString('es-CL')}</small></div><div className="text-end"><Badge bg="primary">{c.nivel_experiencia}</Badge><br />{c.pago_verificado ? <Badge bg="success">✅</Badge> : <Badge bg="warning" text="dark">⏳</Badge>}</div></div></div>)}</div>
          ) : (
            <Table hover responsive className="mb-0"><thead><tr><th>Nombre</th><th>Plan</th><th>IMC</th><th>Estado Pago</th><th>Fecha</th></tr></thead><tbody>{ultimosClientes.map(c => <tr key={c.id}><td className="fw-bold">{c.nombre}</td><td><Badge bg="primary">{c.nivel_experiencia}</Badge></td><td>{c.imc || '-'}</td><td>{c.pago_verificado ? <Badge bg="success">✅ Pagado</Badge> : <Badge bg="warning" text="dark">⏳ Pendiente</Badge>}</td><td>{new Date(c.created_at).toLocaleDateString('es-CL')}</td></tr>)}</tbody></Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Envío Masivo */}
      <Modal show={mostrarModalEnvio} onHide={() => {}} backdrop="static" keyboard={false} centered>
        <Modal.Header className="bg-warning text-dark"><Modal.Title>📩 Enviando mensajes...</Modal.Title></Modal.Header>
        <Modal.Body className="text-center p-4">
          <h4 className="fw-bold mb-3">Enviando {progresoEnvio.actual} de {progresoEnvio.total}</h4>
          <ProgressBar now={progresoEnvio.total > 0 ? (progresoEnvio.actual / progresoEnvio.total) * 100 : 0} animated variant="warning" style={{ height: '20px' }} />
          <p className="text-muted small mt-3 mb-0">Por favor, no cierres esta ventana hasta que termine.</p>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Dashboard;