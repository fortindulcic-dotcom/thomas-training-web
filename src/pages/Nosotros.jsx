// src/pages/Nosotros.jsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';


const Nosotros = () => {
  return (
    <div>
      <Container className="my-5">
        <Row className="align-items-center">
          {/* Columna de la Imagen */}
          <Col lg={5} className="mb-4 mb-lg-0 text-center">
            <img 
              src="/images/thomas_profile.jpg" 
              alt="Thomas Fortin" 
              className="img-fluid profile-img w-100"
              style={{
                borderRadius: '15px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                maxHeight: '500px',
                objectFit: 'cover'
              }}
            />
            <div className="text-center mt-3">
              <a 
                href="https://linktr.ee/tfortinb" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-outline-dark btn-sm"
              >
                <i className="bi bi-instagram me-2"></i>@tfortinb_
              </a>
            </div>
          </Col>

          {/* Columna de Texto */}
          <Col lg={7} className="ps-lg-5">
            <h1 className="display-4 fw-bold mb-4">Acerca de Shut Up and Train</h1>
            
            <div 
              className="highlight-card p-4 shadow-sm mb-4"
              style={{ borderLeft: '5px solid #0dcaf0', background: 'white' }}
            >
              <h4 className="fw-bold text-info">Resultados Impulsados por Ciencia Real</h4>
              <p className="lead mb-0">
                En Shut Up and Train, nos dedicamos a transformar tu físico y a compartir la ciencia detrás de ello de una forma directa y aplicable.
              </p>
            </div>

            <h3 className="fw-bold">Nuestra Misión</h3>
            <p>
              Nuestra misión es clara: ofrecer la orientación más eficaz y respaldada por la evidencia para ayudarte a maximizar tu físico. 
              Cortamos el ruido y las conjeturas, enfocándonos en lo que realmente impulsa la hipertrofia y la mejora estética. 
              Bajo la visión de <strong>Thomas Fortin</strong>, combinamos los estándares de la <strong>estética visual de alto rendimiento</strong> 
              con la exigencia y simetría del <strong>Classic Physique</strong>.
            </p>

            <h3 className="fw-bold mt-4">Nuestra Historia</h3>
            <p>
              Lo que comenzó como una pasión por el entrenamiento de alto rendimiento ha evolucionado en un sistema de coaching 1-1 diseñado para quienes no se conforman con lo ordinario. No dependemos de anécdotas; cada recomendación se basa en métodos probados que han transformado no solo el cuerpo de Thomas, sino el de cientos de alumnos que hoy viven y respiran este estilo de vida.
            </p>
            
            <div className="mt-4">
              <span className="badge bg-dark p-2 me-2">#ClassicPhysique</span>
              <span className="badge bg-dark p-2 me-2">#EliteModel</span>
              <span className="badge bg-dark p-2">#ScienceBased</span>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Nosotros;