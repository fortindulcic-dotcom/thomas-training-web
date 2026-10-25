import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Badge, Spinner, Table, Button } from 'react-bootstrap';
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
    renovaciones: { total: 0, renovadas: 0, noRenovadas: 0 },
    porVencer: [], vencidos: []
  });
  const [datosMensuales, setDatosMensuales] = useState([]);
  const [clientesPorPlan, setClientesPorPlan] = useState([]);
  const [ultimosClientes, setUltimosClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [esMovil, setEsMovil] = useState(false);

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
    
    // Fechas exactas
    const primerDiaMesStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
    const ultimoDiaMesObj = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    const ultimoDiaMesStr = `${ultimoDiaMesObj.getFullYear()}-${String(ultimoDiaMesObj.getMonth() + 1).padStart(2, '0')}-${String(ultimoDiaMesObj.getDate()).padStart(2, '0')}`;
    
    const hoyStr = hoy.toISOString().split('T')[0];
    const en5dias = new Date(hoy); en5dias.setDate(en5dias.getDate() + 5);
    const en5diasStr = en5dias.toISOString().split('T')[0];
    const hace30dias = new Date(hoy); hace30dias.setDate(hace30dias.getDate() - 30);
    const hace30diasStr = hace30dias.toISOString().split('T')[0];

    // 1. Traer todos los clientes y rutinas
    const { data: todosClientes } = await supabase.from('clientes').select('*');
    const { data: todasRutinas } = await supabase.from('rutinas').select('*');

    // 2. PAGOS (Contamos TODOS los clientes de la base de datos para las pruebas)
    const pagosConfirmados = (todosClientes || []).filter(p => p.pago_verificado).length;
    const pagosPendientes = (todosClientes || []).filter(p => !p.pago_verificado).length;
    const totalPagos = (todosClientes || []).length;

    // 3. RENOVACIONES (15 exactas, usando la lógica que ya te funcionó)
    const renovacionesData = (todosClientes || []).filter(c => {
      if (!c.fecha_vencimiento || c.es_renovacion !== true) return false;
      const fecha = c.fecha_vencimiento.substring(0, 10);
      return fecha >= primerDiaMesStr && fecha <= ultimoDiaMesStr;
    });

    const totalARenovar = renovacionesData.length;
    const renovadas = renovacionesData.filter(c => c.estado_pago === 'pagado' || c.estado_pago === 'pendiente').length;
    const noRenovadas = totalARenovar - renovadas;

    // 4. Rutinas del Mes (Usando el mismo filtro de texto)
    const rutinasMes = (todasRutinas || []).filter(r => {
      if (!r.created_at) return false;
      const fecha = r.created_at.substring(0, 10);
      return fecha >= primerDiaMesStr && fecha <= ultimoDiaMesStr;
    });
    const rutinasActivas = rutinasMes.filter(r => r.estado === 'activa').length;
    const rutinasBorrador = rutinasMes.filter(r => r.estado === 'borrador').length;

    // 5. Por Vencer y Vencidos
    const porVencerData = (todasRutinas || []).filter(r => 
      r.estado === 'activa' && r.fecha_vencimiento >= hoyStr && r.fecha_vencimiento <= en5diasStr
    );

    const vencidosData = (todasRutinas || []).filter(r => 
      r.estado === 'activa' && r.fecha_vencimiento < hace30diasStr
    );

    const clienteIds = [
      ...(porVencerData || []).map(r => r.cliente_id),
      ...(vencidosData || []).map(r => r.cliente_id)
    ].filter(Boolean);

    let clientesMap = {};
    if (clienteIds.length > 0) {
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('id, nombre')
        .in('id', [...new Set(clienteIds)]);
      (clientesData || []).forEach(c => { clientesMap[c.id] = c; });
    }

    const porVencerFiltrados = (porVencerData || []).map(r => ({ ...r, clientes: clientesMap[r.cliente_id] }));
    const vencidosFiltrados = (vencidosData || []).map(r => ({ ...r, clientes: clientesMap[r.cliente_id] }));

    // 6. Tendencia
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const datos12Meses = [];
    const fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 11, 1);
    for (let i = 0; i < 12; i++) {
      const fecha = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth() + i, 1);
      const mesStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const clientesMesCountTrend = (todosClientes || []).filter(c => {
        return c.created_at && c.created_at.substring(0, 7) === mesStr;
      }).length;
      datos12Meses.push({ mes: meses[fecha.getMonth()], año: fecha.getFullYear(), clientes: clientesMesCountTrend, etiqueta: `${meses[fecha.getMonth()]} ${String(fecha.getFullYear()).slice(-2)}` });
    }
    const datosConTendencia = calcularTendencia(datos12Meses);

    // 7. Clientes por Plan
    const planesCount = {};
    (todosClientes || []).forEach(c => {
      const plan = c.tipo_producto === 'rutina_prediseñada' ? 'Rutinas Prediseñadas' : c.nivel_experiencia;
      planesCount[plan] = (planesCount[plan] || 0) + 1;
    });
    const totalPlanes = Object.values(planesCount).reduce((a, b) => a + b, 0);
    const distribucionPlanes = Object.keys(planesCount).map(plan => {
      const cant = planesCount[plan];
      const pct = totalPlanes > 0 ? Math.round((cant / totalPlanes) * 100) : 0;
      return { name: plan, value: cant, percentage: pct };
    });

    const recientes = (todosClientes || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);

    setStats({
      clientesTotales: (todosClientes || []).length,
      clientesMes: pagosConfirmados, // En pruebas, todos los pagados son de este mes
      pagosMes: { total: totalPagos, confirmados: pagosConfirmados, pendientes: pagosPendientes },
      rutinasMes: { total: rutinasMes.length, activas: rutinasActivas, borradores: rutinasBorrador },
      renovaciones: { total: totalARenovar, renovadas: renovadas, noRenovadas: noRenovadas },
      porVencer: porVencerFiltrados, vencidos: vencidosFiltrados
    });
    setDatosMensuales(datosConTendencia);
    setClientesPorPlan(distribucionPlanes);
    setUltimosClientes(recientes || []);
    setCargando(false);
  };

  if (cargando) {
    return <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-3 text-muted">Cargando...</p></div>;
  }

  const datosPagosDona = [{ name: 'Confirmados', value: stats.pagosMes.confirmados, color: COLORS.success }, { name: 'Pendientes', value: stats.pagosMes.pendientes, color: COLORS.warning }];
  const datosRutinasDona = [{ name: 'Activas', value: stats.rutinasMes.activas, color: COLORS.success }, { name: 'Borradores', value: stats.rutinasMes.borradores, color: COLORS.warning }];
  const datosRenovacionesDona = [{ name: 'Renovadas', value: stats.renovaciones.renovadas, color: COLORS.success }, { name: 'No Renovadas', value: stats.renovaciones.noRenovadas, color: COLORS.warning }];

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div><h4 className="fw-bold mb-1">Bienvenido, Thomas 👋</h4><p className="text-muted mb-0 small">Resumen de tu negocio hoy.</p></div>
        <Badge bg="success" className="p-2">● Sistema activo</Badge>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={12} md={4}><Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}><Card.Body className="p-3"><p className="mb-1 opacity-75 small">Clientes Totales</p><h4 className="fw-bold mb-0">{stats.clientesTotales}</h4><small className="opacity-75">+{stats.clientesMes} este mes</small></Card.Body></Card></Col>
        <Col xs={12} md={4}><Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', color: 'white' }}><Card.Body className="p-3"><p className="mb-1 opacity-75 small">🔄 Por Vencer</p><h4 className="fw-bold mb-0">{stats.porVencer.length}</h4><small className="opacity-75">≤5 días</small></Card.Body></Card></Col>
        <Col xs={12} md={4}><Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)', color: 'white' }}><Card.Body className="p-3"><p className="mb-1 opacity-75 small">⚠️ Vencidos</p><h4 className="fw-bold mb-0">{stats.vencidos.length}</h4><small className="opacity-75">+30 días</small></Card.Body></Card></Col>
      </Row>

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

      <Row className="g-3 mb-4">
        <Col xs={12} md={3}><Card className="border-0 shadow-sm h-100"><Card.Body className="p-3"><h6 className="fw-bold mb-3">💰 Pagos</h6><div style={{ position: 'relative' }}><ResponsiveContainer width="100%" height={160}><PieChart><Pie data={datosPagosDona} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">{datosPagosDona.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}><div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.pagosMes.total}</div></div></div><div className="d-flex justify-content-around mt-2"><div className="text-center"><Badge bg="success">{stats.pagosMes.confirmados}</Badge><br /><small>Conf.</small></div><div className="text-center"><Badge bg="warning" text="dark">{stats.pagosMes.pendientes}</Badge><br /><small>Pend.</small></div></div></Card.Body></Card></Col>
        
        <Col xs={12} md={3}><Card className="border-0 shadow-sm h-100"><Card.Body className="p-3"><h6 className="fw-bold mb-3">📝 Rutinas</h6><div style={{ position: 'relative' }}><ResponsiveContainer width="100%" height={160}><PieChart><Pie data={datosRutinasDona} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">{datosRutinasDona.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}><div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.rutinasMes.total}</div></div></div><div className="d-flex justify-content-around mt-2"><div className="text-center"><Badge bg="success">{stats.rutinasMes.activas}</Badge><br /><small>Activas</small></div><div className="text-center"><Badge bg="warning" text="dark">{stats.rutinasMes.borradores}</Badge><br /><small>Borr.</small></div></div></Card.Body></Card></Col>

        <Col xs={12} md={3}><Card className="border-0 shadow-sm h-100"><Card.Body className="p-3"><h6 className="fw-bold mb-3">🔄 Renovaciones</h6><div style={{ position: 'relative' }}><ResponsiveContainer width="100%" height={160}><PieChart><Pie data={datosRenovacionesDona} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">{datosRenovacionesDona.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}><div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.renovaciones.total}</div></div></div><div className="d-flex justify-content-around mt-2"><div className="text-center"><Badge bg="success">{stats.renovaciones.renovadas}</Badge><br /><small>Renov.</small></div><div className="text-center"><Badge bg="warning" text="dark">{stats.renovaciones.noRenovadas}</Badge><br /><small>No Renov.</small></div></div></Card.Body></Card></Col>

        <Col xs={12} md={3}><Card className="border-0 shadow-sm h-100"><Card.Body className="p-3"><h6 className="fw-bold mb-3">🎯 Clientes por Plan</h6><ResponsiveContainer width="100%" height={160}><PieChart><Pie data={clientesPorPlan} cx="50%" cy="50%" outerRadius={65} paddingAngle={3} dataKey="value">{clientesPorPlan.map((e, i) => <Cell key={i} fill={PLAN_COLORS[e.name] || COLORS.primary} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="mt-2">{clientesPorPlan.map(p => <div key={p.name} className="d-flex justify-content-between small mb-1"><span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '3px', backgroundColor: PLAN_COLORS[p.name], marginRight: '6px' }}></span>{p.name}</span><strong>{p.value} ({p.percentage}%)</strong></div>)}</div></Card.Body></Card></Col>
      </Row>

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
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

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
    </>
  );
};

export default Dashboard;