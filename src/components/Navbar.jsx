// src/components/Navbar.jsx

import { Navbar as BsNavbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const MyNavbar = () => {
  return (
    <BsNavbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BsNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src="/images/Logo_Thomas.jpg"
            alt="Logo Shut Up and Train"
            style={{ height: '40px', width: '40px', borderRadius: '50%', objectFit: 'cover', marginRight: '10px' }}
          />
          Shut Up and Train
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/nosotros">Nosotros</Nav.Link>
            {/* CAMBIO AQUÍ: de /contactanos a /contacto */}
            <Nav.Link as={Link} to="/contacto">Contacto</Nav.Link>
            <Nav.Link as={Link} to="/evaluacion">Evaluación</Nav.Link>
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default MyNavbar;