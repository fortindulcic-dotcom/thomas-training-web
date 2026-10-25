import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Alert, Spinner, Form, Row, Col, Card, Button, ButtonGroup } from 'react-bootstrap';
import { supabase } from '../utils/supabase';
import { useEsMovil } from '../utils/useEsMovil';

const AdminClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const esMovil = useEsMovil();

  const cargarClientes = async () => {
    setCargando(true);
    
    // Traemos clientes con sus rutinas para saber si renovaron
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        rutinas (
          id,
          estado,
          token
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      setMensaje({ type: 'danger', text: 'Error al cargar: ' + error.message });
    } else {
      // Calcular estado de cada cliente
      const conEstado = (data || []).map(c => {
        const tieneRutina = c.rutinas && c.rutinas.length > 0;
        const tieneRenovacion = c.rutinas && c.rutinas.length > 1;
        let estado = 'pendiente';
        if (c.pago_verificado) {
          estado = tieneRenovacion ? 'renovado' : 'pagado';
        }
        return { ...c, estadoCalculado: estado, totalRutinas: c.rutinas?.length || 0 };
      });

      setClientes(conEstado);
      setFiltrados(conEstado);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let resultado = clientes;
    
    if (busqueda) {
      resultado = resultado.filter(c =>
        c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.email?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(c => c.estadoCalculado === filtroEstado);
    }
    
    setFiltrados(resultado);
  }, [busqueda, filtroEstado, clientes]);

  const copiarLink = (token) => {
    const link = `${window.location.origin}/r/${token}`;
    navigator.clipboard.writeText(link);
    alert('✅ Link copiado al portapapeles');
  };

  const agregarContacto = (cliente) => {
    const telefono = cliente.telefono || '';
    navigator.clipboard.writeText(telefono);
    
    const mensaje = encodeURIComponent(
      `Hola ${cliente.nombre}, soy Thomas Trainer. ¿Me agregas a tus contactos para enviarte tus rutinas?`
    );
    const telefonoLimpio = telefono.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${telefonoLimpio}?text=${mensaje}`, '_blank');
  };

  // Contadores
  const totalTodos = clientes.length;
  const totalPagados = clientes.filter(c => c.estadoCalculado === 'pagado').length;
  const totalRenovados = clientes.filter(c => c.estadoCalculado === 'renovado').length;
  const totalPendientes = clientes.filter(c => c.estadoCalculado === 'pendiente').length;

  if (cargando) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Cargando clientes...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold mb-1">👥 Todos los Clientes</h4>
          <p className="text-muted mb-0 small">Historial completo de clientes.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Badge bg="secondary" className="p-2">Total: {totalTodos}</Badge>
          <Badge bg="success" className="p-2">Pagados: {totalPagados}</Badge>
          <Badge bg="info" className="p-2">Renovados: {totalRenovados}</Badge>
          <Badge bg="warning" text="dark" className="p-2">Pendientes: {totalPendientes}</Badge>
        </div>
      </div>

      {mensaje && <Alert variant={mensaje.type}>{mensaje.text}</Alert>}

      <div className="bg-white p-3 rounded shadow-sm mb-3">
        <Row className="g-2">
          <Col xs={12} md={6}>
            <Form.Control
              placeholder="🔍 Buscar por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </Col>
          <Col xs={12} md={6}>
            <ButtonGroup className="w-100">
              <Button
                variant={filtroEstado === 'todos' ? 'primary' : 'outline-primary'}
                onClick={() => setFiltroEstado('todos')}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={filtroEstado === 'pagado' ? 'success' : 'outline-success'}
                onClick={() => setFiltroEstado('pagado')}
                size="sm"
              >
                Pagados
              </Button>
              <Button
                variant={filtroEstado === 'renovado' ? 'info' : 'outline-info'}
                onClick={() => setFiltroEstado('renovado')}
                size="sm"
              >
                Renovados
              </Button>
              <Button
                variant={filtroEstado === 'pendiente' ? 'warning' : 'outline-warning'}
                onClick={() => setFiltroEstado('pendiente')}
                size="sm"
              >
                Pendientes
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </div>

      {filtrados.length === 0 ? (
        <Alert variant="info">No se encontraron clientes con esos filtros.</Alert>
      ) : esMovil ? (
        <div className="d-flex flex-column gap-2">
          {filtrados.map((c) => {
            const rutinaActiva = c.rutinas?.find(r => r.estado === 'activa');
            return (
              <Card key={c.id} className="border-0 shadow-sm">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <strong className="d-block">{c.nombre}</strong>
                      <small className="text-muted">
                        {new Date(c.created_at).toLocaleDateString('es-CL')}
                      </small>
                    </div>
                    {c.estadoCalculado === 'renovado' && <Badge bg="info">🔄 Renovado</Badge>}
                    {c.estadoCalculado === 'pagado' && <Badge bg="success">✅ Pagado</Badge>}
                    {c.estadoCalculado === 'pendiente' && <Badge bg="warning" text="dark">⏳ Pendiente</Badge>}
                  </div>
                  <div className="small mb-2">
                    <div>📧 {c.email}</div>
                    <div>📱 {c.telefono}</div>
                  </div>
                  <div className="d-flex gap-2 flex-wrap mb-2">
                    <Badge bg="primary">{c.nivel_experiencia}</Badge>
                    <Badge bg="secondary">IMC: {c.imc || '-'}</Badge>
                    <Badge bg="dark">{c.totalRutinas} rutina(s)</Badge>
                  </div>
                  <div className="d-flex gap-2">
                    {rutinaActiva && rutinaActiva.token && (
                      <>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => copiarLink(rutinaActiva.token)}
                        >
                          🔗 Copiar link
                        </Button>
                        <a
                          href={`${window.location.origin}/r/${rutinaActiva.token}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          👁️ Ver
                        </a>
                      </>
                    )}
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => agregarContacto(c)}
                    >
                      📇 Agregar
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded shadow-sm">
          <Table hover responsive className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Fecha</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>WhatsApp</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Rutinas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => {
                const rutinaActiva = c.rutinas?.find(r => r.estado === 'activa');
                return (
                  <tr key={c.id}>
                    <td className="text-nowrap">
                      {new Date(c.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td className="fw-bold">{c.nombre}</td>
                    <td>{c.email}</td>
                    <td>
                      <a href={`https://wa.me/${c.telefono?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                        {c.telefono}
                      </a>
                    </td>
                    <td><Badge bg="primary">{c.nivel_experiencia}</Badge></td>
                    <td>
                      {c.estadoCalculado === 'renovado' && <Badge bg="info">🔄 Renovado</Badge>}
                      {c.estadoCalculado === 'pagado' && <Badge bg="success">✅ Pagado</Badge>}
                      {c.estadoCalculado === 'pendiente' && <Badge bg="warning" text="dark">⏳ Pendiente</Badge>}
                    </td>
                    <td className="text-center">
                      <Badge bg="dark">{c.totalRutinas}</Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        {rutinaActiva && rutinaActiva.token && (
                          <>
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => copiarLink(rutinaActiva.token)}
                              title="Copiar link de rutina"
                            >
                              🔗
                            </Button>
                            <a
                              href={`${window.location.origin}/r/${rutinaActiva.token}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-outline-primary"
                              title="Ver rutina"
                            >
                              👁️
                            </a>
                          </>
                        )}
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => agregarContacto(c)}
                          title="Agregar a contactos"
                        >
                          📇
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default AdminClientes;