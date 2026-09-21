// src/pages/Contacto.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';

const Contacto = () => {
  // 1. Estado para los datos del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });

  // 2. Función de manejo del envío
  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });

    // Validaciones básicas
    if (!nombre || !email || !mensaje) {
      setStatus({ type: 'danger', msg: 'Por favor, completa todos los campos.' });
      return;
    }

    // Validación simple de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus({ type: 'danger', msg: 'Por favor, ingresa un email válido.' });
      return;
    }

    // Aquí iría la lógica para enviar el mensaje (ej: a un backend o servicio de correo)
    // Por ahora, simulamos un envío exitoso
    console.log('Datos enviados:', { nombre, email, mensaje });
    
    setStatus({ type: 'success', msg: '¡Gracias! Tu mensaje ha sido enviado correctamente.' });
    
    // Limpiar formulario
    setNombre('');
    setEmail('');
    setMensaje('');
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-success text-white">
              <h3 className="mb-0">Contáctanos</h3>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formNombre">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Tu nombre completo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formMensaje">
                  <Form.Label>Mensaje</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="¿En qué podemos ayudarte?"
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                  />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100">
                  Enviar Mensaje
                </Button>
              </Form>

              {/* Mostrar Mensajes de Estado */}
              {status.msg && (
                <Alert variant={status.type} className="mt-4">
                  {status.msg}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Contacto;