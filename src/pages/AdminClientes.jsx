import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Alert, Spinner, Form, Row, Col, Card } from 'react-bootstrap';
import { supabase } from '../utils/supabase';
import { useEsMovil } from '../utils/useEsMovil';

const AdminClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroPago, setFiltroPago] = useState('todos');
  const esMovil = useEsMovil();

  const cargarClientes = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setMensaje({ type: 'danger', text: 'Error al cargar: ' + error.message });
    } else {
      setClientes(data || []);
      setFiltrados(data || []);
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
    if (filtroPago === 'pagado') {
      resultado = resultado.filter(c => c.pago_verificado === true);
    } else if (filtroPago === 'pendiente') {
      resultado = resultado.filter(c => c.pago_verificado === false);
    }
    setFiltrados(resultado);
  }, [busqueda, filtroPago, clientes]);

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
        <Badge bg="primary" className="p-2">
          Total: {clientes.length}
        </Badge>
      </div>

      {mensaje && <Alert variant={mensaje.type}>{mensaje.text}</Alert>}

      <div className="bg-white p-3 rounded shadow-sm mb-3">
        <Row className="g-2">
          <Col xs={12} md={8}>
            <Form.Control
              placeholder="🔍 Buscar por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </Col>
          <Col xs={12} md={4}>
            <Form.Select value={filtroPago} onChange={(e) => setFiltroPago(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="pagado">✅ Pagados</option>
              <option value="pendiente">⏳ Pendientes</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {filtrados.length === 0 ? (
        <Alert variant="info">No se encontraron clientes con esos filtros.</Alert>
      ) : esMovil ? (
        // ===== VISTA MÓVIL: TARJETAS =====
        <div className="d-flex flex-column gap-2">
          {filtrados.map((c) => (
            <Card key={c.id} className="border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <strong className="d-block">{c.nombre}</strong>
                    <small className="text-muted">
                      {new Date(c.created_at).toLocaleDateString('es-CL')}
                    </small>
                  </div>
                  {c.pago_verificado ? (
                    <Badge bg="success">✅ Pagado</Badge>
                  ) : (
                    <Badge bg="warning" text="dark">⏳ Pendiente</Badge>
                  )}
                </div>
                <div className="small mb-2">
                  <div>📧 {c.email}</div>
                  <div>📱 {c.telefono}</div>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <Badge bg="primary">{c.nivel_experiencia}</Badge>
                  <Badge bg="secondary">IMC: {c.imc || '-'}</Badge>
                  <a
                    href={`https://wa.me/${c.telefono?.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-success py-0"
                    style={{ fontSize: '0.75rem' }}
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        // ===== VISTA DESKTOP: TABLA =====
        <div className="bg-white rounded shadow-sm">
          <Table hover responsive className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Fecha Registro</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>WhatsApp</th>
                <th>Plan</th>
                <th>IMC</th>
                <th>Estado Pago</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => (
                <tr key={c.id}>
                  <td className="text-nowrap">
                    {new Date(c.created_at).toLocaleDateString('es-CL', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="fw-bold">{c.nombre}</td>
                  <td>{c.email}</td>
                  <td>
                    <a href={`https://wa.me/${c.telefono?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                      {c.telefono}
                    </a>
                  </td>
                  <td><Badge bg="primary">{c.nivel_experiencia}</Badge></td>
                  <td>{c.imc || '-'}</td>
                  <td>
                    {c.pago_verificado ? (
                      <Badge bg="success">✅ Pagado</Badge>
                    ) : (
                      <Badge bg="warning" text="dark">⏳ Pendiente</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default AdminClientes;