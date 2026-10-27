// src/pages/Contacto.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';

const Contacto = () => {
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });

    if (!nombre || !mensaje) {
      setStatus({ type: 'danger', msg: 'Por favor, completa tu nombre y tu mensaje.' });
      return;
    }

    // Número de Thomas (sin el +)
    const numero = '56995484848';
    
    // Armamos el mensaje con el nombre del cliente
    const texto = `Hola Thomas, soy ${nombre}. ${mensaje}`;
    
    // Abrimos WhatsApp en una pestaña nueva
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank');
    
    // Mostramos un mensaje de éxito
    setStatus({ type: 'success', msg: '¡Abriendo WhatsApp! Por favor, presiona "Enviar" en la aplicación para completar tu mensaje.' });
    
    // Limpiamos el formulario
    setNombre('');
    setMensaje('');
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-success text-white py-3">
              <h3 className="mb-0">Contáctanos por WhatsApp</h3>
            </Card.Header>
            <Card.Body className="p-4">
              <p className="text-muted mb-4">
                ¿Tienes dudas? Escríbenos y te responderemos a la brevedad.
              </p>
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formNombre">
                  <Form.Label className="fw-bold">Tu Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formMensaje">
                  <Form.Label className="fw-bold">Tu Mensaje</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="¿En qué te podemos ayudar?"
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                  />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100 fw-bold py-2">
                  💬 Enviar por WhatsApp
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