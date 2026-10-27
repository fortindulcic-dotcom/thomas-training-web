// src/pages/Evaluacion.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, Badge } from 'react-bootstrap';

const Evaluacion = () => {
  // Estados del formulario
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState('hombre'); // 'hombre' o 'mujer'
  
  // Estados de resultado y errores
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  const calcularResultado = (pesoNum, alturaNum, edadNum, sexoVal) => {
    // 1. Calcular IMC (Altura en metros)
    const alturaMetros = alturaNum / 100;
    const imc = pesoNum / (alturaMetros * alturaMetros);
    
    // Clasificación del IMC
    let nivelImc = '';
    let colorImc = '';
    if (imc < 18.5) {
      nivelImc = 'Bajo peso';
      colorImc = 'info';
    } else if (imc >= 18.5 && imc < 24.9) {
      nivelImc = 'Peso saludable';
      colorImc = 'success';
    } else if (imc >= 25 && imc < 29.9) {
      nivelImc = 'Sobrepeso';
      colorImc = 'warning';
    } else {
      nivelImc = 'Obesidad';
      colorImc = 'danger';
    }

    // 2. Calcular TMB con Fórmula Mifflin-St Jeor
    let tmb = 0;
    if (sexoVal === 'hombre') {
      tmb = (10 * pesoNum) + (6.25 * alturaNum) - (5 * edadNum) + 5;
    } else {
      tmb = (10 * pesoNum) + (6.25 * alturaNum) - (5 * edadNum) - 161;
    }

    // 3. Mensaje Motivador
    let mensaje = '';
    if (imc < 18.5) {
      mensaje = '¡Vamos a construir masa muscular! Tu cuerpo necesita nutrirse y entrenar fuerte para crecer. Estás en el lugar correcto. 💪';
    } else if (imc >= 18.5 && imc < 24.9) {
      mensaje = '¡Estás en un excelente punto de partida! Ahora es momento de optimizar tu composición corporal y llevar tu rendimiento al siguiente nivel. 🔥';
    } else if (imc >= 25 && imc < 29.9) {
      mensaje = '¡Gran decisión dar el primer paso! Con constancia y el plan correcto, esos kilos de más se convertirán en energía y músculo. ¡Vamos con todo! 🚀';
    } else {
      mensaje = 'El cambio más grande comienza con una decisión. No importa dónde estés hoy, importa hacia dónde vamos. ¡Estamos aquí para acompañarte en cada paso! 🌟';
    }

    return { 
      imc: imc.toFixed(2), 
      nivelImc, 
      colorImc,
      tmb: Math.round(tmb),
      mensaje 
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setResultado(null);

    // Validaciones
    if (!peso || !altura || !edad) {
      setError('Por favor, completa todos los campos (peso, altura y edad).');
      return;
    }

    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);
    const edadNum = parseInt(edad, 10);

    if (isNaN(pesoNum) || isNaN(alturaNum) || isNaN(edadNum)) {
      setError('Todos los valores deben ser números válidos.');
      return;
    }

    if (pesoNum < 20 || pesoNum > 300) {
      setError('El peso debe estar entre 20 y 300 kg.');
      return;
    }
    if (alturaNum < 50 || alturaNum > 250) {
      setError('La altura debe estar entre 50 y 250 cm.');
      return;
    }
    if (edadNum < 10 || edadNum > 100) {
      setError('La edad debe estar entre 10 y 100 años.');
      return;
    }

    const calculo = calcularResultado(pesoNum, alturaNum, edadNum, sexo);
    setResultado(calculo);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center py-3">
              <h4 className="mb-0">Calculadora de TMB e IMC</h4>
              <Link to="/" className="btn btn-light btn-sm fw-bold">
                &larr; Volver
              </Link>
            </Card.Header>
            <Card.Body className="p-4">
              <p className="text-muted text-center mb-4">
                Descubre cuántas calorías quema tu cuerpo en reposo y conoce tu estado actual.
              </p>

              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="formSexo">
                      <Form.Label className="fw-bold">Sexo Biológico</Form.Label>
                      <Form.Select value={sexo} onChange={(e) => setSexo(e.target.value)}>
                        <option value="hombre">Hombre</option>
                        <option value="mujer">Mujer</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formEdad">
                      <Form.Label className="fw-bold">Edad</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Ej: 30"
                        value={edad}
                        onChange={(e) => setEdad(e.target.value)}
                        min="10"
                        max="100"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group controlId="formPeso">
                      <Form.Label className="fw-bold">Peso (kg)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        placeholder="Ej: 70.5"
                        value={peso}
                        onChange={(e) => setPeso(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formAltura">
                      <Form.Label className="fw-bold">Altura (cm)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Ej: 175"
                        value={altura}
                        onChange={(e) => setAltura(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button variant="primary" type="submit" className="w-100 py-2 fw-bold fs-5">
                  Calcular Resultados
                </Button>
              </Form>

              {error && (
                <Alert variant="danger" className="mt-4">
                  {error}
                </Alert>
              )}

              {resultado && (
                <Card className="mt-4 border-0 shadow-sm bg-light">
                  <Card.Body className="text-center p-4">
                    <h4 className="mb-4">Tus Resultados</h4>
                    
                    <Row className="justify-content-center mb-4">
                      <Col xs={6}>
                        <div className="p-3 bg-white rounded shadow-sm">
                          <h6 className="text-muted mb-1">IMC</h6>
                          <h2 className={`fw-bold text-${resultado.colorImc} mb-0`}>{resultado.imc}</h2>
                          <Badge bg={resultado.colorImc} className="mt-2">{resultado.nivelImc}</Badge>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="p-3 bg-white rounded shadow-sm">
                          <h6 className="text-muted mb-1">TMB (Calorías/día)</h6>
                          <h2 className="fw-bold text-primary mb-0">{resultado.tmb}</h2>
                          <small className="text-muted">En reposo absoluto</small>
                        </div>
                      </Col>
                    </Row>

                    <div className="bg-white p-3 rounded shadow-sm border-start border-4 border-success">
                      <p className="mb-0 fs-5 fst-italic">"{resultado.mensaje}"</p>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Evaluacion;