import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, Outlet } from 'react-router-dom';

const PASSWORD = 'thomas2026';

const Admin = () => {
  const [autorizado, setAutorizado] = useState(
    sessionStorage.getItem('adminAuth') === 'true'
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === PASSWORD) {
      sessionStorage.setItem('adminAuth', 'true');
      setAutorizado(true);
      setError('');
    } else {
      setError('Contraseña incorrecta.');
    }
  };

  if (!autorizado) {
    return (
      <Container className="my-5" style={{ maxWidth: '400px' }}>
        <h2>Panel de Administración</h2>
        <p className="text-muted">Ingresa la contraseña para acceder.</p>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100">Entrar</Button>
        </Form>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1>Panel de Administración</h1>
      <p className="text-muted">Bienvenido, Thomas.</p>
      <div className="mb-4">
        <Link to="/admin/precios" className="btn btn-outline-primary me-2">Configurar Precios</Link>
        <Link to="/admin/rutinas" className="btn btn-outline-primary">Generar Rutinas</Link>
      </div>
      <Outlet />
    </Container>
  );
};

export default Admin;