// src/pages/PlanDetalle.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, ListGroup } from 'react-bootstrap';

const PlanDetalle = ({ nombre, imagen, colorClass, caracteristicas }) => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center align-items-center">
        <Col md={6} className="text-center mb-4 mb-md-0">
          <img
            src={imagen}
            alt={`Plan ${nombre}`}
            className="img-fluid rounded shadow"
            style={{ maxHeight: '600px', width: '100%', objectFit: 'cover' }}
          />
        </Col>
        <Col md={6}>
          <h1 className={`fw-bold mb-3 ${colorClass}`}>Plan {nombre}</h1>
          <p className="lead">Todo lo que incluye este plan:</p>
          <ListGroup variant="flush" className="mb-4">
            {caracteristicas.map((item, idx) => (
              <ListGroup.Item key={idx}>✅ {item}</ListGroup.Item>
            ))}
          </ListGroup>
          <div className="d-flex flex-wrap gap-2">
            <Link to={`/admision?plan=${nombre}`} className="btn btn-success fw-bold">
              Quiero este plan
            </Link>
            <Link to="/" className="btn btn-outline-secondary fw-bold">
              &larr; Volver al Inicio
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PlanDetalle;