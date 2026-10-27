// src/pages/Admision.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import IntakeFormPublico from '../components/IntakeFormPublico';
import { supabase } from '../utils/supabase';

const WHATSAPP_THOMAS = '56995484848';

const Admision = () => {
  const [paso, setPaso] = useState(1);
  const [datosCliente, setDatosCliente] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [searchParams] = useSearchParams();

  // Detectar si viene un plan preseleccionado desde PlanDetalle
  const planPreseleccionado = searchParams.get('plan');

  useEffect(() => {
    if (planPreseleccionado) {
      setDatosCliente(prev => ({
        ...(prev || {}),
        nivel_experiencia: planPreseleccionado
      }));
    }
  }, [planPreseleccionado]);

  const obtenerLinkPago = (nivel) => {
    // CORRECCIÓN: Eliminado "Básico" para estandarizar todo a Principiante
    const links = {
      'Principiante': 'https://www.webpay.cl/form-pay/423837',
      'Intermedio': 'https://www.webpay.cl/form-pay/423861',
      'Avanzado': 'https://www.webpay.cl/form-pay/423862',
    };
    return links[nivel] || 'https://www.webpay.cl/form-pay/423837';
  };

  const obtenerMensajeWhatsApp = (cliente) => {
    const plan = cliente.nivel_experiencia;
    // CORRECCIÓN: Eliminado "Básico" de los precios
    const precios = {
      'Principiante': '$60.000',
      'Intermedio': '$90.000',
      'Avanzado': '$150.000',
    };
    const precio = precios[plan] || '$XX.XXX';

    return encodeURIComponent(
      `Hola Thomas! Soy ${cliente.nombre}.\n\n` +
      `Acabo de pagar el Plan ${plan} (${precio}) en tu sitio web.\n\n` +
      `Mi correo es ${cliente.email}.\n\n` +
      `Quedo atento a mi rutina. ¡Gracias!`
    );
  };

  const handleDatosListos = (datos) => {
    setDatosCliente(datos);
    setPaso(2);
  };

  const handleIrAPagar = async () => {
    setGuardando(true);

    // 1. Guardar cliente como "visitante"
    const { data: clienteData, error: errorCliente } = await supabase
      .from('clientes')
      .insert([{
        ...datosCliente,
        estado_pago: 'visitante',
        pago_verificado: false
      }])
      .select();

    if (errorCliente) {
      alert('Error al guardar: ' + errorCliente.message);
      setGuardando(false);
      return;
    }

    const cliente = clienteData[0];

    // 2. Abrir Webpay en ventana pequeña
    const ancho = 500;
    const alto = 700;
    const left = (window.screen.width - ancho) / 2;
    const top = (window.screen.height - alto) / 2;
    window.open(
      obtenerLinkPago(cliente.nivel_experiencia),
      'WebpayCheckout',
      `width=${ancho},height=${alto},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    // 3. Pasar al paso 3 (WhatsApp)
    setDatosCliente(cliente);
    setPaso(3);
    setGuardando(false);
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          {paso === 1 && (
            <>
              <h1 className="mb-4 text-center">Comienza tu Transformación</h1>
              {planPreseleccionado && (
                <Alert variant="info" className="text-center">
                  Has seleccionado el <strong>Plan {planPreseleccionado}</strong>. Completa tus datos para continuar.
                </Alert>
              )}
              <p className="text-center text-muted mb-5">
                Completa este formulario y te recomendaremos el plan ideal para ti.
              </p>
              <IntakeFormPublico
                onDatosListos={handleDatosListos}
                datosIniciales={datosCliente}
              />
            </>
          )}

          {paso === 2 && datosCliente && (
            <Card className="shadow">
              <Card.Body className="text-center p-5">
                <h2 className="text-success mb-4">Revisa tu plan recomendado</h2>
                <p className="lead">
                  Basado en tu experiencia de <strong>{datosCliente.meses_entrenando} meses</strong>
                  {datosCliente.imc && <> y un IMC de <strong>{datosCliente.imc}</strong></>},
                  tu plan recomendado es:
                </p>
                <h1 className="display-4 fw-bold text-primary my-4">
                  Plan {datosCliente.nivel_experiencia}
                </h1>
                <p className="text-muted">
                  Objetivo: {datosCliente.objetivo} | {datosCliente.dias_disponibles} días/semana
                </p>
                <hr />
                <p>El siguiente paso es realizar el pago para que Thomas comience a preparar tu rutina.</p>
                <Button
                  variant="success"
                  size="lg"
                  className="mt-3 w-100"
                  onClick={handleIrAPagar}
                  disabled={guardando}
                >
                  {guardando ? 'Procesando...' : `Ir a Pagar Plan ${datosCliente.nivel_experiencia} con Webpay`}
                </Button>
                <Button
                  variant="outline-secondary"
                  className="mt-3 w-100"
                  onClick={() => setPaso(1)}
                  disabled={guardando}
                >
                  Volver al formulario
                </Button>
              </Card.Body>
            </Card>
          )}

          {paso === 3 && datosCliente && (
            <Card className="shadow border-0">
              <Card.Body className="text-center p-5">
                <div style={{ fontSize: '4rem' }}>🎉</div>
                <h2 className="text-success mb-3">¡Ya casi terminamos!</h2>

                <Alert variant="info" className="text-start">
                  <h5 className="fw-bold">📋 Últimos pasos:</h5>
                  <ol className="mb-0">
                    <li className="mb-2">
                      <strong>Completa tu pago</strong> en la ventana de Webpay que acabamos de abrir.
                    </li>
                    <li className="mb-2">
                      <strong>Después de pagar</strong>, avísale a Thomas por WhatsApp para que confirme tu pago.
                    </li>
                    <li>
                      Thomas verificará y comenzará a preparar tu rutina. ¡Te contactará pronto!
                    </li>
                  </ol>
                </Alert>

                <div className="d-grid gap-2 mt-4">
                  <Button
                    variant="success"
                    size="lg"
                    href={`https://wa.me/${WHATSAPP_THOMAS}?text=${obtenerMensajeWhatsApp(datosCliente)}`}
                    target="_blank"
                  >
                    💬 Avisar a Thomas por WhatsApp
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      const ancho = 500;
                      const alto = 700;
                      const left = (window.screen.width - ancho) / 2;
                      const top = (window.screen.height - alto) / 2;
                      window.open(
                        obtenerLinkPago(datosCliente.nivel_experiencia),
                        'WebpayCheckout',
                        `width=${ancho},height=${alto},left=${left},top=${top},scrollbars=yes,resizable=yes`
                      );
                    }}
                  >
                    🔄 Volver a abrir Webpay
                  </Button>
                </div>

                <hr className="my-4" />
                <small className="text-muted">
                  ¿Problemas? Escríbele directamente a Thomas al +56 9 9548 4848
                </small>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Admision;