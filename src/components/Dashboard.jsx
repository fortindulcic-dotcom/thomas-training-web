import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Badge, Spinner, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import { supabase } from '../utils/supabase';

const COLORS = {
  primary: '#667eea',
  success: '#43e97b',
  warning: '#f5576c',
  info: '#4facfe',
  purple: '#764ba2',
  orange: '#f093fb',
  teal: '#38f9d7',
  dark: '#1a1f36'
};

const PLAN_COLORS = {
  'Principiante': '#4facfe',
  'Intermedio': '#667eea',
  'Avanzado': '#764ba2',
  'Rutinas Prediseñadas': '#f093fb'
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
    ...d,
    tendencia: Math.max(0, Math.round(pendiente * i + interseccion))
  }));

  const proximosMeses = [];
  for (let i = 1; i <= 2; i++) {
    const proyeccion = Math.max(0, Math.round(pendiente * (n - 1 + i) + interseccion));
    const ultimoMes = datos[datos.length - 1];
    const mesIndex = (meses.indexOf(ultimoMes.mes) + i) % 12;

    proximosMeses.push({
      mes: meses[mesIndex],
      etiqueta: `+${i}`,
      clientes: null,
      tendencia: proyeccion
    });
  }

  return [...datosConTendencia, ...proximosMeses];
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    clientesTotales: 0,
    clientesMes: 0,
    pagosMes: { total: 0, confirmados: 0, pendientes: 0 },
    rutinasMes: { total: 0, activas: 0, borradores: 0 },
    tasaRenovacion: 0
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
    const añoActual = hoy.getFullYear();
    const mesActual = hoy.getMonth();
    const primerDiaMes = new Date(añoActual, mesActual, 1).toISOString();

    // ===== 1. Clientes totales (SOLO pagados) =====
    const { count: totalClientes } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('estado_pago', 'pagado');

    // ===== 1b. Clientes del mes (SOLO pagados) =====
    const { count: clientesMes } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('estado_pago', 'pagado')
      .gte('created_at', primerDiaMes);

    // ===== 2. Pagos del mes (todos los que llegaron al pago) =====
    const { data: pagosMes } = await supabase
      .from('clientes')
      .select('pago_verificado, estado_pago')
      .gte('created_at', primerDiaMes);

    const pagosConfirmados = (pagosMes || []).filter(p => p.pago_verificado).length;
    const pagosPendientes = (pagosMes || []).filter(p => !p.pago_verificado).length;

    // ===== 3. Rutinas del mes =====
    const { data: rutinasMes } = await supabase
      .from('rutinas')
      .select('estado')
      .gte('created_at', primerDiaMes);

    const rutinasActivas = (rutinasMes || []).filter(r => r.estado === 'activa').length;
    const rutinasBorrador = (rutinasMes || []).filter(r => r.estado === 'borrador').length;

    // ===== 4. Tasa de renovación (SOLO clientes pagados) =====
    const { data: todosClientes } = await supabase
      .from('clientes')
      .select('es_renovacion, nivel_experiencia, tipo_producto, created_at')
      .eq('estado_pago', 'pagado');

    const totalRenovaciones = (todosClientes || []).filter(c => c.es_renovacion).length;
    const totalNuevos = (todosClientes || []).filter(c => !c.es_renovacion).length;
    const tasaRenovacion = totalNuevos > 0 ? ((totalRenovaciones / totalNuevos) * 100).toFixed(0) : 0;

    // ===== 5. Datos mensuales (últimos 12 meses) =====
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const datos12Meses = [];

    const fechaInicio = new Date(añoActual, mesActual - 11, 1);

    for (let i = 0; i < 12; i++) {
      const fecha = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth() + i, 1);
      const año = fecha.getFullYear();
      const mes = fecha.getMonth();
      const finMes = new Date(año, mes + 1, 0, 23, 59, 59);

      const clientesMes = (todosClientes || []).filter(c => {
        const f = new Date(c.created_at);
        return f >= fecha && f <= finMes;
      });

      datos12Meses.push({
        mes: meses[mes],
        año: año,
        clientes: clientesMes.length,
        etiqueta: `${meses[mes]} ${String(año).slice(-2)}`
      });
    }

    const datosConTendencia = calcularTendencia(datos12Meses);

    // ===== 6. Clientes por plan =====
    const planesCount = {};
    (todosClientes || []).forEach(c => {
      const plan = c.tipo_producto === 'rutina_prediseñada' ? 'Rutinas Prediseñadas' : c.nivel_experiencia;
      planesCount[plan] = (planesCount[plan] || 0) + 1;
    });

    const distribucionPlanes = Object.keys(planesCount).map(plan => ({
      name: plan,
      value: planesCount[plan]
    }));

    // ===== 7. Últimos 5 clientes (SOLO pagados) =====
    const { data: recientes } = await supabase
      .from('clientes')
      .select('*')
      .eq('estado_pago', 'pagado')
      .order('created_at', { ascending: false })
      .limit(5);

    setStats({
      clientesTotales: totalClientes || 0,
      clientesMes: clientesMes || 0,
      pagosMes: {
        total: (pagosMes || []).length,
        confirmados: pagosConfirmados,
        pendientes: pagosPendientes
      },
      rutinasMes: {
        total: (rutinasMes || []).length,
        activas: rutinasActivas,
        borradores: rutinasBorrador
      },
      tasaRenovacion: parseInt(tasaRenovacion)
    });
    setDatosMensuales(datosConTendencia);
    setClientesPorPlan(distribucionPlanes);
    setUltimosClientes(recientes || []);
    setCargando(false);
  };

  if (cargando) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando estadísticas...</p>
      </div>
    );
  }

  const añoActual = new Date().getFullYear();
  const porcentajePagos = stats.pagosMes.total > 0
    ? Math.round((stats.pagosMes.confirmados / stats.pagosMes.total) * 100)
    : 0;

  const datosPagosDona = [
    { name: 'Confirmados', value: stats.pagosMes.confirmados, color: COLORS.success },
    { name: 'Pendientes', value: stats.pagosMes.pendientes, color: COLORS.warning }
  ];

  const datosRutinasDona = [
    { name: 'Activas', value: stats.rutinasMes.activas, color: COLORS.success },
    { name: 'Borradores', value: stats.rutinasMes.borradores, color: COLORS.warning }
  ];

  return (
    <>
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold mb-1">Bienvenido, Thomas 👋</h4>
          <p className="text-muted mb-0 small">Resumen de tu negocio hoy.</p>
        </div>
        <Badge bg="success" className="p-2">● Sistema activo</Badge>
      </div>

      {/* FILA 1: KPIs */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="mb-1 opacity-75 small">Clientes Totales</p>
                  <h3 className="fw-bold mb-0">{stats.clientesTotales}</h3>
                  <small className="opacity-75">+{stats.clientesMes} este mes</small>
                </div>
                <div style={{ fontSize: '2rem' }}>👥</div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="mb-1 opacity-75 small">Pagos del Mes</p>
                  <h3 className="fw-bold mb-0">{stats.pagosMes.confirmados}/{stats.pagosMes.total}</h3>
                  <small className="opacity-75">{porcentajePagos}% confirmados</small>
                </div>
                <div style={{ fontSize: '2rem' }}>💰</div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="mb-1 opacity-75 small">Rutinas del Mes</p>
                  <h3 className="fw-bold mb-0">{stats.rutinasMes.activas}/{stats.rutinasMes.total}</h3>
                  <small className="opacity-75">{stats.rutinasMes.borradores} por revisar</small>
                </div>
                <div style={{ fontSize: '2rem' }}>📝</div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="mb-1 opacity-75 small">Tasa Renovación</p>
                  <h3 className="fw-bold mb-0">{stats.tasaRenovacion}%</h3>
                  <small className="opacity-75">Clientes que vuelven</small>
                </div>
                <div style={{ fontSize: '2rem' }}>🔄</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* FILA 2: GRÁFICO PRINCIPAL */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <div className="mb-3">
            <h6 className="fw-bold mb-0">📊 Clientes Nuevos por Mes</h6>
            <small className="text-muted">Últimos 12 meses + proyección (Año {añoActual})</small>
          </div>
          <ResponsiveContainer width="100%" height={esMovil ? 250 : 320}>
            <ComposedChart data={datosMensuales} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis
                dataKey="etiqueta"
                tick={{ fontSize: esMovil ? 9 : 12 }}
                angle={esMovil ? -45 : 0}
                textAnchor={esMovil ? 'end' : 'middle'}
                height={esMovil ? 50 : 30}
              />
              <YAxis tick={{ fontSize: esMovil ? 10 : 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="clientes" name="Clientes" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
              <Line
                type="monotone"
                dataKey="tendencia"
                name="Tendencia"
                stroke={COLORS.warning}
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: COLORS.warning }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      {/* FILA 3: 3 DONAS */}
      <Row className="g-3 mb-4">
        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <h6 className="fw-bold mb-3">💰 Pagos del Mes</h6>
              <div style={{ position: 'relative' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={datosPagosDona} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                      {datosPagosDona.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1f36' }}>{stats.pagosMes.total}</div>
                  <small className="text-muted">Total</small>
                </div>
              </div>
              <div className="d-flex justify-content-around mt-2">
                <div className="text-center">
                  <Badge bg="success">{stats.pagosMes.confirmados}</Badge>
                  <br /><small style={{ fontSize: '0.75rem' }}>Confirmados</small>
                </div>
                <div className="text-center">
                  <Badge bg="warning" text="dark">{stats.pagosMes.pendientes}</Badge>
                  <br /><small style={{ fontSize: '0.75rem' }}>Pendientes</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <h6 className="fw-bold mb-3">📝 Rutinas del Mes</h6>
              <div style={{ position: 'relative' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={datosRutinasDona} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                      {datosRutinasDona.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1f36' }}>{stats.rutinasMes.total}</div>
                  <small className="text-muted">Total</small>
                </div>
              </div>
              <div className="d-flex justify-content-around mt-2">
                <div className="text-center">
                  <Badge bg="success">{stats.rutinasMes.activas}</Badge>
                  <br /><small style={{ fontSize: '0.75rem' }}>Activas</small>
                </div>
                <div className="text-center">
                  <Badge bg="warning" text="dark">{stats.rutinasMes.borradores}</Badge>
                  <br /><small style={{ fontSize: '0.75rem' }}>Borradores</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <h6 className="fw-bold mb-3">🎯 Clientes por Plan</h6>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={clientesPorPlan}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    label={esMovil ? false : ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {clientesPorPlan.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PLAN_COLORS[entry.name] || COLORS.primary} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 text-center">
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {clientesPorPlan.reduce((acc, p) => acc + p.value, 0)} clientes acumulados
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* FILA 4: ÚLTIMOS CLIENTES */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0">🕐 Últimos Clientes</h6>
            <Button as={Link} to="/admin/clientes" variant="link" size="sm" className="p-0">
              Ver todos →
            </Button>
          </div>

          {ultimosClientes.length === 0 ? (
            <p className="text-muted text-center py-4">Aún no hay clientes registrados.</p>
          ) : esMovil ? (
            <div>
              {ultimosClientes.map((c) => (
                <div key={c.id} className="border-bottom py-2">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{c.nombre}</strong>
                      <br />
                      <small className="text-muted">{new Date(c.created_at).toLocaleDateString('es-CL')}</small>
                    </div>
                    <div className="text-end">
                      <Badge bg="primary" className="mb-1">{c.nivel_experiencia}</Badge>
                      <br />
                      {c.pago_verificado ? (
                        <Badge bg="success">✅</Badge>
                      ) : (
                        <Badge bg="warning" text="dark">⏳</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Plan</th>
                  <th>IMC</th>
                  <th>Estado Pago</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ultimosClientes.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-bold">{c.nombre}</td>
                    <td><Badge bg="primary">{c.nivel_experiencia}</Badge></td>
                    <td>{c.imc || '-'}</td>
                    <td>
                      {c.pago_verificado ? (
                        <Badge bg="success">✅ Pagado</Badge>
                      ) : (
                        <Badge bg="warning" text="dark">⏳ Pendiente</Badge>
                      )}
                    </td>
                    <td>{new Date(c.created_at).toLocaleDateString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default Dashboard;