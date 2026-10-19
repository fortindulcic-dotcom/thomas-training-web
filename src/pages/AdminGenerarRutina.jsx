import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Alert, Spinner, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useEsMovil } from '../utils/useEsMovil';

const AdminGenerarRutina = () => {
  const [rutinas, setRutinas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();
  const esMovil = useEsMovil();

  const cargarRutinas = async () => {
    setCargando(true);
    
    const { data, error } = await supabase
      .from('rutinas')
      .select(`
        *,
        clientes (
          id,
          nombre,
          email,
          nivel_experiencia,
          imc,
          objetivo
        )
      `)
      .neq('estado', 'archivada') // <-- Filtro clave
      .order('created_at', { ascending: false });

    if (error) {
      setMensaje({ type: 'danger', text: 'Error al cargar: ' + error.message });
    } else {
      setRutinas(data || []);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarRutinas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (cargando) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Cargando rutinas...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold mb-1">📝 Gestión de Rutinas</h4>
          <p className="text-muted mb-0 small">
            Aquí aparecen todas las rutinas vigentes (iniciales y renovaciones).
          </p>
        </div>
        <Badge bg="primary" className="p-2">
          {rutinas.length} rutina(s)
        </Badge>
      </div>

      {mensaje && <Alert variant={mensaje.type}>{mensaje.text}</Alert>}

      {rutinas.length === 0 ? (
        <Alert variant="info">
          Aún no hay rutinas vigentes.
        </Alert>
      ) : esMovil ? (
        <div className="d-flex flex-column gap-2">
          {rutinas.map((r) => {
            const cliente = r.clientes;
            if (!cliente) return null;
            
            return (
              <Card key={r.id} className="border-0 shadow-sm">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <strong className="d-block">{cliente.nombre}</strong>
                      <small className="text-muted">
                        {new Date(r.created_at).toLocaleDateString('es-CL')}
                      </small>
                    </div>
                    {r.estado === 'borrador' && <Badge bg="warning" text="dark">📝 Borrador</Badge>}
                    {r.estado === 'activa' && <Badge bg="success">✅ Activa</Badge>}
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted d-block">Rutina:</small>
                    <strong>{r.nombre}</strong>
                  </div>

                  <div className="d-flex gap-2 flex-wrap mb-3">
                    <Badge bg="primary">{cliente.nivel_experiencia}</Badge>
                    <Badge bg="secondary">IMC: {cliente.imc || '-'}</Badge>
                    <Badge bg="info" text="dark">{cliente.objetivo}</Badge>
                  </div>
                  <Button
                    variant={r.estado === 'activa' ? 'outline-primary' : 'primary'}
                    size="sm"
                    className="w-100"
                    onClick={() => navigate(`/admin/rutina/${r.id}`)}
                  >
                    {r.estado === 'activa' ? '👁️ Ver rutina' : '✏️ Ver/Editar rutina'}
                  </Button>
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
                <th>Cliente</th>
                <th>Rutina</th>
                <th>Plan</th>
                <th>IMC</th>
                <th>Objetivo</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {rutinas.map((r) => {
                const cliente = r.clientes;
                if (!cliente) return null;
                
                return (
                  <tr key={r.id}>
                    <td className="text-nowrap">
                      {new Date(r.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td>
                      <strong>{cliente.nombre}</strong>
                      <br />
                      <small className="text-muted">{cliente.email}</small>
                    </td>
                    <td>
                      <small className="text-muted">{r.nombre}</small>
                    </td>
                    <td>
                      <Badge bg="primary">{cliente.nivel_experiencia}</Badge>
                    </td>
                    <td>{cliente.imc || '-'}</td>
                    <td>
                      <small>{cliente.objetivo}</small>
                    </td>
                    <td>
                      {r.estado === 'borrador' && <Badge bg="warning" text="dark">📝 Borrador</Badge>}
                      {r.estado === 'activa' && <Badge bg="success">✅ Activa</Badge>}
                    </td>
                    <td>
                      <Button
                        variant={r.estado === 'activa' ? 'outline-primary' : 'primary'}
                        size="sm"
                        onClick={() => navigate(`/admin/rutina/${r.id}`)}
                      >
                        {r.estado === 'activa' ? '👁️ Ver' : '✏️ Ver/Editar'}
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