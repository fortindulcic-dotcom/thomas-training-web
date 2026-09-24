import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { getPrecios, setPrecios, resetPrecios } from '../utils/precios';

const AdminPrecios = () => {
  const [precios, setPreciosState] = useState(getPrecios());
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    setPreciosState({ ...precios, [e.target.name]: Number(e.target.value) });
  };

  const handleGuardar = () => {
    setPrecios(precios);
    setMensaje('Precios guardados correctamente.');
    setTimeout(() => setMensaje(''), 3000);
  };

  const handleReset = () => {
    resetPrecios();
    setPreciosState(getPrecios());
    setMensaje('Precios restaurados a los valores por defecto.');
    setTimeout(() => setMensaje(''), 3000);
  };

  return (
    <Container className="my-5" style={{ maxWidth: '600px' }}>
      <h1>Configurar Precios</h1>
      <p className="text-muted">Cambia los precios de tus planes. Los cambios se reflejan en las páginas de cada plan.</p>

      {mensaje && <Alert variant="success">{mensaje}</Alert>}

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Rutina Prediseñada ($)</Form.Label>
          <Form.Control type="number" name="rutina" value={precios.rutina} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Plan Básico ($)</Form.Label>
          <Form.Control type="number" name="basico" value={precios.basico} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Plan Intermedio ($)</Form.Label>
          <Form.Control type="number" name="intermedio" value={precios.intermedio} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Plan Avanzado ($)</Form.Label>
          <Form.Control type="number" name="avanzado" value={precios.avanzado} onChange={handleChange} />
        </Form.Group>

        <Button variant="primary" onClick={handleGuardar} className="me-2">Guardar</Button>
        <Button variant="outline-secondary" onClick={handleReset}>Restaurar por defecto</Button>
      </Form>
    </Container>
  );
};

export default AdminPrecios;