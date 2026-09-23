import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Usamos Link para navegación interna

function Footer() {
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <Container>
        <Row>
          {/* Columna 1: Información */}
          <Col md={4} className="mb-3 mb-md-0">
            <h5 className="text-uppercase">Shut Up and Train</h5>
            <p className="text-muted">
              Tus rutinas personalizadas para alcanzar tus objetivos de fitness.
            </p>
          </Col>

          {/* Columna 2: Enlaces rápidos */}
          <Col md={4} className="mb-3 mb-md-0">
            <h5 className="text-uppercase">Enlaces</h5>
            <Nav className="flex-column">
              <Nav.Link as={Link} to="/">Inicio</Nav.Link>
              <Nav.Link as={Link} to="/nosotros">Nosotros</Nav.Link>
              <Nav.Link as={Link} to="/evaluacion">Evaluación</Nav.Link>
              <Nav.Link as={Link} to="/contacto">Contacto</Nav.Link>
              <Nav.Link as={Link} to="/privacidad">Política de Privacidad</Nav.Link>
            </Nav>
          </Col>

          {/* Columna 3: Contacto */}
          <Col md={4}>
            <h5 className="text-uppercase">Contáctanos</h5>
            <ul className="list-unstyled text-light">
              <li><strong>WhatsApp:</strong> +569 9548 4848</li>
              <li><strong>Email:</strong> thomas.fortinb29@gmail.com</li>
              <li><strong>Ubicación:</strong> Santiago, Chile</li>
            </ul>
            <div className="mt-3 text-light">
              {/* Iconos sociales simulados */}
              <span className="me-2">Facebook</span>
              <span className="me-2">Instagram</span>
              <span>TT</span>
            </div>
          </Col>
        </Row>
        
        {/* Línea divisoria y Copyright */}
        <hr className="my-4 border-secondary" />
        <Row className="text-center">
          <Col>
            <small className="text-muted">
              © 2026 Thomas Fortin - Shut Up and Train. Todos los derechos reservados.
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;