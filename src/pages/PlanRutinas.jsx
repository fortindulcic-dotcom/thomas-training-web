import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getPrecios } from '../utils/precios';

const PlanRutinas = () => {
  const precios = getPrecios();

  return (
    <Container className="my-5">
      <Row className="align-items-center">
        <Col lg={5} className="mb-4 mb-lg-0 text-center">
          <img
            src="/images/rutinas_portada.jpg"
            alt="Rutinas Prediseñadas"
            className="img-fluid profile-img w-100"
            style={{
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              maxHeight: '500px',
              objectFit: 'cover',
            }}
          />
        </Col>
        <Col lg={7} className="ps-lg-5">
          <h1 className="display-4 fw-bold mb-4">Rutinas Prediseñadas</h1>

          <div
            className="highlight-card p-4 shadow-sm mb-4"
            style={{ borderLeft: '5px solid #0dcaf0', background: 'white' }}
          >
            <h4 className="fw-bold text-info">Elige, paga y entrena</h4>
            <p className="lead mb-0">
              Rutinas listas para usar, diseñadas por Thomas Fortin. Sin formularios, sin esperas.
            </p>
          </div>

          <h3 className="fw-bold">¿Qué incluye?</h3>
          <ul>
            <li>Rutinas de pecho, brazos, piernas, espalda y más.</li>
            <li>Niveles básico y avanzado.</li>
            <li>Formato profesional en PDF, listo para imprimir o llevar al gym.</li>
            <li>Entrega inmediata tras confirmar el pago.</li>
          </ul>

          <h3 className="fw-bold mt-4">Precio</h3>
          <p className="h3 text-success fw-bold">
            ${precios.rutina.toLocaleString('es-CL')} por rutina
          </p>

          <div className="d-flex gap-3 mt-4">
            <a
              href="https://www.webpay.cl/form-pay/423848"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-info btn-lg fw-bold"
            >
              Comprar ahora
            </a>
            <Link to="/" className="btn btn-outline-secondary btn-lg">
              Volver al Inicio
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PlanRutinas;