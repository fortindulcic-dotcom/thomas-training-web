import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner, Form, Badge } from 'react-bootstrap';
import { supabase } from '../utils/supabase';

const Renovar = () => {
  const { token } = useParams();
  const [cargando, setCargando] = useState(true);
  const [rutina, setRutina] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [error, setError] = useState(null);
  const [paso, setPaso] = useState(1); // 1: métricas, 2: pago
  const [peso, setPeso] = useState('');
  const [cintura, setCintura] = useState('');
  const [pecho, setPecho] = useState('');
  const [brazo, setBrazo] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);

    // Buscar la rutina por token
    const { data: rutinaData, error: errorRutina } = await supabase
      .from('rutinas')
      .select('*')
      .eq('token', token.toUpperCase())
      .single();

    if (errorRutina || !rutinaData) {
      setError('Rutina no encontrada. Verifica el link.');
      setCargando(false);
      return;
    }

    // Verificar si ya expiró (opcional)
    if (rutinaData.fecha_vencimiento) {
      const hoy = new Date();
      const vencimiento = new Date(rutinaData.fecha_vencimiento);
      // Permitimos renovar incluso si ya venció, pero mostramos info
    }

    // Cargar cliente
    const { data: clienteData } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', rutinaData.cliente_id)
      .single();

    setRutina(rutinaData);
    setCliente(clienteData);
    // Precargar el peso actual del cliente si existe
    if (clienteData?.peso) {
      setPeso(clienteData.peso);
    }
    setCargando(false);
  };

  const guardarMetricas = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const medidas = {};
    if (cintura) medidas.cintura = parseFloat(cintura);
    if (pecho) medidas.pecho = parseFloat(pecho);
    if (brazo) medidas.brazo = parseFloat(brazo);

    const { error } = await supabase
      .from('clientes')
      .update({
        peso_actual: parseFloat(peso),
        medidas_actuales: Object.keys(medidas).length > 0 ? medidas : null,
        renovacion_solicitada: true,
        fecha_renovacion_solicitada: new Date().toISOString()
      })
      .eq('id', cliente.id);

    if (error) {
      alert('Error al guardar: ' + error.message);
      setGuardando(false);
      return;
    }

    setPaso(2);
    setGuardando(false);
  };

  const obtenerLinkPago = (nivel) => {
    const links = {
      'Principiante': 'https://www.webpay.cl/form-pay/423837',
      'Intermedio': 'https://www.webpay.cl/form-pay/423861',
      'Avanzado': 'https://www.webpay.cl/form-pay/423862',
    };
    return links[nivel] || 'https://www.webpay.cl/form-pay/423837';
  };

  if (cargando) {
    return (
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="info" />
          <p className="mt-3">Cargando tu plan...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5" style={{ maxWidth: '500px' }}>
        <Card className="border-0 shadow">
          <Card.Body className="text-center p-5">
            <div style={{ fontSize: '4rem' }}>🔒</div>
            <h3 className="fw-bold mt-3">Acceso restringido</h3>
            <p className="text-muted">{error}</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          {paso === 1 && (
            <>
              <div className="text-center mb-4">
                <h1 className="display-5 fw-bold text-primary">¡Renueva tu plan!</h1>
                <p className="text-muted">
                  Hola {cliente?.nombre}, es momento de continuar con tu transformación.
                </p>
              </div>

              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">📋 Tu plan actual</h5>
                  <Row className="text-center">
                    <Col>
                      <small className="text-muted d-block">Plan</small>
                      <Badge bg="primary">{cliente?.nivel_experiencia}</Badge>
                    </Col>
                    <Col>
                      <small className="text-muted d-block">Vence</small>
                      <strong>{rutina.fecha_vencimiento ? new Date(rutina.fecha_vencimiento).toLocaleDateString('es-CL') : '-'}</strong>
                    </Col>
                    <Col>
                      <small className="text-muted d-block">Objetivo</small>
                      <strong>{cliente?.objetivo}</strong>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">📏 Actualiza tus métricas</h5>
                  <p className="text-muted small">
                    Necesitamos tus nuevos datos para generar tu próxima rutina con los pesos actualizados.
                  </p>
                  <Form onSubmit={guardarMetricas}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Peso actual (kg) *</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.1"
                            value={peso}
                            onChange={(e) => setPeso(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Cintura (cm) - Opcional</Form.Label>
                          <Form.Control
                            type="number"
                            value={cintura}
                            onChange={(e) => setCintura(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Pecho (cm) - Opcional</Form.Label>
                          <Form.Control
                            type="number"
                            value={pecho}
                            onChange={(e) => setPecho(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Brazo (cm) - Opcional</Form.Label>
                          <Form.Control
                            type="number"
                            value={brazo}
                            onChange={(e) => setBrazo(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button
                      variant="success"
                      type="submit"
                      size="lg"
                      className="w-100"
                      disabled={guardando}
                    >
                      {guardando ? 'Guardando...' : 'Continuar al pago'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </>
          )}

          {paso === 2 && (
            <Card className="border-0 shadow">
              <Card.Body className="text-center p-5">
                <div style={{ fontSize: '4rem' }}>🎉</div>
                <h2 className="text-success mb-3">¡Métricas guardadas!</h2>
                <p className="lead">
                  Para activar tu nueva rutina, completa el pago del <strong>Plan {cliente.nivel_experiencia}</strong>.
                </p>
                <Alert variant="info" className="text-start mt-4">
                  <h6 className="fw-bold">📋 Últimos pasos:</h6>
                  <ol className="mb-0">
                    <li>Completa el pago en Webpay.</li>
                    <li>Thomas revisará tus nuevas métricas y generará tu rutina actualizada.</li>
                    <li>Recibirás tu nuevo plan por WhatsApp.</li>
                  </ol>
                </Alert>
                <Button
                  variant="success"
                  size="lg"
                  className="mt-4 w-100"
                  href={obtenerLinkPago(cliente.nivel_experiencia)}
                  target="_blank"
                >
                  💳 Ir a Pagar Plan {cliente.nivel_experiencia}
                </Button>
                <Button
                  variant="outline-secondary"
                  className="mt-3 w-100"
                  onClick={() => setPaso(1)}
                >
                  Volver a las métricas
                </Button>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Renovar;