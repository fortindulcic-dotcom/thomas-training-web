import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Nav, Offcanvas } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Dashboard from '../components/Dashboard';

const PASSWORD = 'thomas2026';

const Admin = () => {
  const [autorizado, setAutorizado] = useState(
    sessionStorage.getItem('adminAuth') === 'true'
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();

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

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setAutorizado(false);
    setPassword('');
  };

  if (!autorizado) {
    return (
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <Card className="shadow-lg border-0" style={{ maxWidth: '420px', width: '100%' }}>
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <div style={{ fontSize: '3rem' }}>🔐</div>
              <h3 className="fw-bold mt-3">Panel de Administración</h3>
              <p className="text-muted">Área privada de Thomas Fortin</p>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  size="lg"
                  placeholder="••••••••"
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="w-100" size="lg">
                Ingresar al Panel
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const path = location.pathname;
  const esDashboard = path === '/admin' || path === '/admin/';
  const esPrecios = path.includes('precios');
  const esRutinas = path.includes('generar-rutina');
  const esPagos = path.includes('pagos-pendientes');
  const esClientes = path.includes('clientes');

  // Contenido del menú (reutilizable para sidebar y offcanvas móvil)
  const contenidoMenu = (
    <>
      <div className="mb-5 mt-3 px-2">
        <h5 className="fw-bold mb-1" style={{ letterSpacing: '1px' }}>💪 TFCOACHING</h5>
        <small className="text-white-50">Panel de Thomas</small>
      </div>

      <Nav className="flex-column flex-grow-1">
        <Nav.Link as={Link} to="/admin" onClick={() => setMenuAbierto(false)} className={`text-white mb-2 px-3 py-2 rounded ${esDashboard ? 'bg-primary' : ''}`}>
          <span className="me-2">📊</span> Dashboard
        </Nav.Link>
        <Nav.Link as={Link} to="/admin/clientes" onClick={() => setMenuAbierto(false)} className={`text-white mb-2 px-3 py-2 rounded ${esClientes ? 'bg-primary' : ''}`}>
          <span className="me-2">👥</span> Clientes
        </Nav.Link>
        <Nav.Link as={Link} to="/admin/pagos-pendientes" onClick={() => setMenuAbierto(false)} className={`text-white mb-2 px-3 py-2 rounded ${esPagos ? 'bg-primary' : ''}`}>
          <span className="me-2">💰</span> Confirmar Pagos
        </Nav.Link>
        <Nav.Link as={Link} to="/admin/renovaciones" className={`text-white mb-2 px-3 py-2 rounded ${path.includes('renovaciones') ? 'bg-primary' : ''}`}>
          <span className="me-2">🔄</span> Renovaciones
        </Nav.Link>
        <Nav.Link as={Link} to="/admin/generar-rutina" onClick={() => setMenuAbierto(false)} className={`text-white mb-2 px-3 py-2 rounded ${esRutinas ? 'bg-primary' : ''}`}>
          <span className="me-2">📝</span> Gestión de Rutinas
        </Nav.Link>
        <Nav.Link as={Link} to="/admin/precios" onClick={() => setMenuAbierto(false)} className={`text-white mb-2 px-3 py-2 rounded ${esPrecios ? 'bg-primary' : ''}`}>
          <span className="me-2">💵</span> Configurar Precios
        </Nav.Link>
      </Nav>

      <div className="border-top border-secondary pt-3 mt-3">
        <div className="px-2 mb-2">
          <small className="text-white-50 d-block">Conectado como</small>
          <strong className="text-white">Thomas Fortin</strong>
        </div>
        <Button variant="outline-light" size="sm" className="w-100" onClick={handleLogout}>
          🚪 Cerrar Sesión
        </Button>
      </div>
    </>
  );

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* SIDEBAR DESKTOP (oculto en móvil) */}
      <div
        className="text-white d-none d-lg-flex flex-column p-3 shadow"
        style={{
          width: '260px',
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #1a1f36 0%, #2d3350 100%)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0
        }}
      >
        {contenidoMenu}
      </div>

      {/* MENÚ MÓVIL (offcanvas) */}
      <Offcanvas
        show={menuAbierto}
        onHide={() => setMenuAbierto(false)}
        className="text-white"
        style={{ background: 'linear-gradient(180deg, #1a1f36 0%, #2d3350 100%)', width: '280px' }}
      >
        <Offcanvas.Body className="d-flex flex-column p-3">
          {contenidoMenu}
        </Offcanvas.Body>
      </Offcanvas>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-grow-1" style={{ overflowY: 'auto', minWidth: 0 }}>
        {/* BARRA SUPERIOR MÓVIL */}
        <div
          className="d-lg-none d-flex align-items-center justify-content-between p-3 shadow-sm"
          style={{ background: 'linear-gradient(90deg, #1a1f36 0%, #2d3350 100%)', color: 'white', position: 'sticky', top: 0, zIndex: 100 }}
        >
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => setMenuAbierto(true)}
          >
            ☰
          </Button>
          <strong style={{ letterSpacing: '1px' }}>💪 TFCOACHING</strong>
          <div style={{ width: '40px' }}></div>
        </div>

        {/* CONTENIDO */}
        <div className="p-3 p-lg-4">
          {esDashboard ? <Dashboard /> : <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
