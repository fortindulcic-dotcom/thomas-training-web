import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Alert, Spinner, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useEsMovil } from '../utils/useEsMovil';

const AdminGenerarRutina = () => {
  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();
  const esMovil = useEsMovil();

  const cargarPendientes = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        rutinas (
          id,
          estado,
          activa,
          nombre
        )
      `)
      .eq('pago_verificado', true)
      .order('created_at', { ascending: false });

    if (error) {
      setMensaje({ type: 'danger', text: 'Error al cargar: ' + error.message });
    } else {
      setPendientes(data || []);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarPendientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <h4 className="fw-bold mb-1">📝 Rutinas de Clientes</h4>
          <p className="text-muted mb-0 small">
            Clientes que ya pagaron. Revisa, edita y activa sus rutinas.
          </p>
        </div>
        <Badge bg="primary" className="p-2">
          {pendientes.length} cliente(s)
        </Badge>
      </div>

      {mensaje && <Alert variant={mensaje.type}>{mensaje.text}</Alert>}

      {pendientes.length === 0 ? (
        <Alert variant="info">
          Aún no hay clientes con pago verificado. Ve a <strong>Pagos Pendientes</strong> para confirmar pagos primero.
        </Alert>
      ) : esMovil ? (
        // ===== VISTA MÓVIL: TARJETAS =====
        <div className="d-flex flex-column gap-2">
          {pendientes.map((c) => {
            const rutina = c.rutinas && c.rutinas[0];
            const estadoRutina = rutina ? rutina.estado : 'sin_rutina';
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
                    {estadoRutina === 'borrador' && <Badge bg="warning" text="dark">📝 Borrador</Badge>}
                    {estadoRutina === 'activa' && <Badge bg="success">✅ Activa</Badge>}
                    {estadoRutina === 'sin_rutina' && <Badge bg="secondary">Sin rutina</Badge>}
                  </div>
                  <div className="d-flex gap-2 flex-wrap mb-3">
                    <Badge bg="primary">{c.nivel_experiencia}</Badge>
                    <Badge bg="secondary">IMC: {c.imc || '-'}</Badge>
                    <Badge bg="info" text="dark">{c.objetivo}</Badge>
                  </div>
                  <Button
                    variant={estadoRutina === 'activa' ? 'outline-primary' : 'primary'}
                    size="sm"
                    className="w-100"
                    onClick={() => c.rutinas && c.rutinas[0] ? navigate(`/admin/rutina/${c.rutinas[0].id}`) : alert('Este cliente no tiene rutina generada.')}
                  >
                    {estadoRutina === 'activa' ? '👁️ Ver rutina' : '✏️ Ver/Editar rutina'}
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      ) : (
        // ===== VISTA DESKTOP: TABLA =====
        <div className="bg-white rounded shadow-sm">
          <Table hover responsive className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Plan</th>
                <th>IMC</th>
                <th>Objetivo</th>
                <th>Estado Rutina</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {pendientes.map((c) => {
                const rutina = c.rutinas && c.rutinas[0];
                const estadoRutina = rutina ? rutina.estado : 'sin_rutina';
                return (
                  <tr key={c.id}>
                    <td className="text-nowrap">
                      {new Date(c.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td>
                      <strong>{c.nombre}</strong>
                      <br />
                      <small className="text-muted">{c.email}</small>
                    </td>
                    <td>
                      <Badge bg="primary">{c.nivel_experiencia}</Badge>
                    </td>
                    <td>{c.imc || '-'}</td>
                    <td>
                      <small>{c.objetivo}</small>
                    </td>
                    <td>
                      {estadoRutina === 'borrador' && <Badge bg="warning" text="dark">📝 Borrador</Badge>}
                      {estadoRutina === 'activa' && <Badge bg="success">✅ Activa</Badge>}
                      {estadoRutina === 'sin_rutina' && <Badge bg="secondary">Sin rutina</Badge>}
                    </td>
                    <td>
                      <Button
                        variant={estadoRutina === 'activa' ? 'outline-primary' : 'primary'}
                        size="sm"
                        onClick={() => c.rutinas && c.rutinas[0] ? navigate(`/admin/rutina/${c.rutinas[0].id}`) : alert('Este cliente no tiene rutina generada.')}
                      >
                        {estadoRutina === 'activa' ? '👁️ Ver' : '✏️ Ver/Editar'}
                      </Button>
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

export default AdminGenerarRutina;