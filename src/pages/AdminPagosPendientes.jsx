import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Badge, Alert, Spinner, Card } from 'react-bootstrap';
import { supabase } from '../utils/supabase';
import { generarRutina } from '../utils/generadorRutinas';
import { useEsMovil } from '../utils/useEsMovil';

const PRECIOS_PLANES = {
  'Principiante': 60000,
  'Intermedio': 90000,
  'Avanzado': 150000
};

const AdminPagosPendientes = () => {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [procesando, setProcesando] = useState(null);
  const esMovil = useEsMovil();

  const cargarClientes = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('pago_verificado', false)
      .in('estado_pago', ['visitante', 'pendiente'])
      .order('created_at', { ascending: false });

    if (error) {
      setMensaje({ type: 'danger', text: 'Error al cargar: ' + error.message });
    } else {
      setClientes(data || []);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Verificar pago + generar rutina automáticamente
  const verificarPago = async (cliente) => {
    setProcesando(cliente.id);
    setMensaje(null);

    // 1. Marcar cliente como pagado
    const { data, error } = await supabase
      .from('clientes')
      .update({
        pago_verificado: true,
        fecha_verificacion: new Date().toISOString(),
        estado_pago: 'pagado'
      })
      .eq('id', cliente.id)
      .select();

    if (error || !data || data.length === 0) {
      setMensaje({ type: 'danger', text: 'Error al verificar: ' + (error?.message || 'Sin datos') });
      setProcesando(null);
      return;
    }

    const clienteActualizado = data[0];

    // 2. Generar la rutina automáticamente
    const ejerciciosGenerados = generarRutina(clienteActualizado);

    const { data: rutinaData, error: errorRutina } = await supabase
      .from('rutinas')
      .insert([{
        cliente_id: clienteActualizado.id,
        nombre: `Rutina para ${clienteActualizado.nombre}`,
        activa: false,
        estado: 'borrador'
      }])
      .select();

    if (errorRutina) {
      setMensaje({ type: 'warning', text: `Pago verificado pero error al crear rutina: ${errorRutina.message}` });
      setProcesando(null);
      cargarClientes();
      return;
    }

    // 3. Guardar los ejercicios
    const rutinaId = rutinaData[0].id;
    const ejerciciosConRutina = ejerciciosGenerados.map(ej => ({ ...ej, rutina_id: rutinaId }));
    await supabase.from('ejercicios').insert(ejerciciosConRutina);

    setMensaje({
      type: 'success',
      text: `✅ ${clienteActualizado.nombre}: pago verificado y rutina generada (${ejerciciosGenerados.length} ejercicios). Revisa "Nueva Rutina" para editarla.`
    });
    setProcesando(null);
    cargarClientes();
  };

  if (cargando) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Cargando confirmaciones...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="p-0">
      <div className="mb-4">
        <h4 className="fw-bold mb-1">💰 Confirmación de Pagos</h4>
        <p className="text-muted mb-0 small">
          Verifica el pago en tu banco y marca como confirmado. Se generará la rutina automáticamente.
        </p>
      </div>

      {mensaje && <Alert variant={mensaje.type}>{mensaje.text}</Alert>}

      {clientes.length === 0 ? (
        <Alert variant="success">
          ✅ No hay confirmaciones pendientes. ¡Estás al día!
        </Alert>
      ) : esMovil ? (
        <div className="d-flex flex-column gap-2">
          {clientes.map((cliente) => {
            const tieneDiscrepancia = cliente.nivel_recomendado && cliente.nivel_experiencia !== cliente.nivel_recomendado;
            const monto = PRECIOS_PLANES[cliente.nivel_experiencia] || 0;
            return (
              <Card key={cliente.id} className="border-0 shadow-sm">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <strong className="d-block">{cliente.nombre}</strong>
                      <small className="text-muted">
                        {new Date(cliente.created_at).toLocaleDateString('es-CL')}
                      </small>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-success">
                        ${monto.toLocaleString('es-CL')}
                      </div>
                      <small className="text-muted">A verificar</small>
                    </div>
                  </div>
                  <div className="small mb-2">
                    <div>📧 {cliente.email}</div>
                    <div>📱 {cliente.telefono}</div>
                  </div>
                  <div className="d-flex gap-2 flex-wrap mb-3">
                    <Badge bg="primary">{cliente.nivel_experiencia}</Badge>
                    {tieneDiscrepancia && (
                      <Badge bg="warning" text="dark">
                        ⚠️ Rec: {cliente.nivel_recomendado}
                      </Badge>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      className="flex-grow-1"
                      onClick={() => verificarPago(cliente)}
                      disabled={procesando === cliente.id}
                    >
                      {procesando === cliente.id ? 'Procesando...' : '✅ Verificar + Generar rutina'}
                    </Button>
                    <a
                      href={`https://wa.me/${cliente.telefono.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-success"
                    >
                      💬
                    </a>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded shadow-sm">
          <Table striped hover responsive className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>WhatsApp</th>
                <th>Plan</th>
                <th className="text-end">Monto</th>
                <th>Discrepancia</th>
                <th>Fecha</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => {
                const tieneDiscrepancia = cliente.nivel_recomendado && cliente.nivel_experiencia !== cliente.nivel_recomendado;
                const monto = PRECIOS_PLANES[cliente.nivel_experiencia] || 0;
                return (
                  <tr key={cliente.id}>
                    <td><strong>{cliente.nombre}</strong></td>
                    <td>{cliente.email}</td>
                    <td>
                      <a href={`https://wa.me/${cliente.telefono.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                        {cliente.telefono}
                      </a>
                    </td>
                    <td>
                      <Badge bg="primary">{cliente.nivel_experiencia}</Badge>
                      {tieneDiscrepancia && (
                        <small className="d-block text-muted">
                          Rec: {cliente.nivel_recomendado}
                        </small>
                      )}
                    </td>
                    <td className="text-end fw-bold text-success">
                      ${monto.toLocaleString('es-CL')}
                    </td>
                    <td>
                      {tieneDiscrepancia ? (
                        <span className="text-warning small">Plan superior</span>
                      ) : (
                        <span className="text-muted small">-</span>
                      )}
                    </td>
                    <td>{new Date(cliente.created_at).toLocaleDateString('es-CL')}</td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => verificarPago(cliente)}
                        disabled={procesando === cliente.id}
                      >
                        {procesando === cliente.id ? '⏳...' : '✅ Verificar'}
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

export default AdminPagosPendientes;