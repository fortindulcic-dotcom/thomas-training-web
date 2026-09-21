// src/pages/Evaluacion.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, ListGroup } from 'react-bootstrap';

// Clave usada en Local Storage. Prefijo propio para no chocar con otras apps guardadas en el navegador.
const STORAGE_KEY = 'sut_evaluaciones';

// --- Funciones auxiliares de Local Storage (Read / integridad de datos) ---

// Lee el historial guardado. Si no existe, está corrupto o no es un arreglo válido, devuelve [].
function cargarHistorial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return []; // valida integridad: debe ser un arreglo
    return data;
  } catch (err) {
    console.error('Error al leer el historial de Local Storage:', err);
    return [];
  }
}

// Guarda el historial completo. Se envuelve en try/catch por si el navegador
// tiene Local Storage deshabilitado o lleno (principio de seguridad: nunca asumir que la escritura siempre funciona).
function guardarHistorial(historial) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historial));
    return true;
  } catch (err) {
    console.error('Error al guardar en Local Storage:', err);
    return false;
  }
}

const Evaluacion = () => {
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [historial, setHistorial] = useState([]);
  const [editandoId, setEditandoId] = useState(null); // null = creando, id = editando ese registro

  // Cargar historial guardado apenas se monta el componente (Read inicial)
  useEffect(() => {
    setHistorial(cargarHistorial());
  }, []);

  const calcularResultado = (pesoNum, alturaNum) => {
    const imc = pesoNum / (alturaNum * alturaNum);
    let nivel = '';
    let rutina = '';

    if (imc < 18.5) {
      nivel = 'Bajo peso';
      rutina = 'Rutina de fuerza para ganancia de masa.';
    } else if (imc >= 18.5 && imc < 24.9) {
      nivel = 'Peso saludable';
      rutina = 'Rutina de mantenimiento y cardio moderado.';
    } else if (imc >= 25 && imc < 29.9) {
      nivel = 'Sobrepeso';
      rutina = 'Rutina de quema de calorías y ejercicio cardiovascular.';
    } else {
      nivel = 'Obesidad';
      rutina = 'Rutina de bajo impacto y control de peso.';
    }

    return { imc: imc.toFixed(2), nivel, rutina };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    setResultado(null);

    // --- Validación de integridad de los datos ---
    if (!peso || !altura) {
      setError('Por favor, ingresa tanto el peso como la altura.');
      return;
    }

    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);

    if (isNaN(pesoNum) || isNaN(alturaNum)) {
      setError('Peso y altura deben ser valores numéricos válidos.');
      return;
    }

    // Rangos razonables para evitar datos absurdos o maliciosos guardados en el historial
    if (pesoNum < 20 || pesoNum > 300) {
      setError('El peso debe estar entre 20 y 300 kg.');
      return;
    }
    if (alturaNum < 0.5 || alturaNum > 2.5) {
      setError('La altura debe estar entre 0.5 y 2.5 metros.');
      return;
    }

    const calculo = calcularResultado(pesoNum, alturaNum);
    setResultado(calculo);

    const registro = {
      id: editandoId ?? Date.now(), // si estamos editando, mantiene el id; si no, crea uno nuevo
      peso: pesoNum,
      altura: alturaNum,
      ...calculo,
      fecha: new Date().toLocaleString('es-CL'),
    };

    let nuevoHistorial;
    if (editandoId) {
      // --- Update ---
      nuevoHistorial = historial.map((item) => (item.id === editandoId ? registro : item));
      setExito('Evaluación actualizada correctamente.');
    } else {
      // --- Create ---
      nuevoHistorial = [registro, ...historial];
      setExito('Evaluación guardada en tu historial.');
    }

    setHistorial(nuevoHistorial);
    guardarHistorial(nuevoHistorial);
    setEditandoId(null);
    setPeso('');
    setAltura('');
  };

  // --- Update (paso 1: cargar los datos del registro en el formulario) ---
  const handleEditar = (registro) => {
    setPeso(registro.peso.toString());
    setAltura(registro.altura.toString());
    setEditandoId(registro.id);
    setResultado(null);
    setError('');
    setExito('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Delete ---
  const handleEliminar = (id) => {
    const nuevoHistorial = historial.filter((item) => item.id !== id);
    setHistorial(nuevoHistorial);
    guardarHistorial(nuevoHistorial);
    if (editandoId === id) {
      setEditandoId(null);
      setPeso('');
      setAltura('');
    }
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setPeso('');
    setAltura('');
    setError('');
    setExito('');
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Evaluación Física</h3>
              <Link to="/" className="btn btn-light btn-sm fw-bold">
                &larr; Volver
              </Link>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formPeso">
                  <Form.Label>Peso (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="Ej: 70.5"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formAltura">
                  <Form.Label>Altura (metros)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="Ej: 1.75"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button variant="primary" type="submit" className="w-100">
                    {editandoId ? 'Actualizar Evaluación' : 'Calcular Rutina'}
                  </Button>
                  {editandoId && (
                    <Button variant="outline-secondary" type="button" onClick={cancelarEdicion}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </Form>

              {error && (
                <Alert variant="danger" className="mt-4">
                  {error}
                </Alert>
              )}

              {exito && (
                <Alert variant="success" className="mt-4">
                  {exito}
                </Alert>
              )}

              {resultado && (
                <Card className="mt-4 border-success">
                  <Card.Body>
                    <Card.Title className="text-success">¡Resultados obtenidos!</Card.Title>
                    <p><strong>Tu IMC es:</strong> {resultado.imc}</p>
                    <p><strong>Nivel:</strong> {resultado.nivel}</p>
                    <hr />
                    <h5 className="text-primary">Tu rutina recomendada:</h5>
                    <p>{resultado.rutina}</p>
                  </Card.Body>
                </Card>
              )}

              {/* --- Historial (Read) guardado en Local Storage --- */}
              {historial.length > 0 && (
                <div className="mt-5">
                  <h5 className="mb-3">Historial de evaluaciones (guardado en este navegador)</h5>
                  <ListGroup>
                    {historial.map((item) => (
                      <ListGroup.Item
                        key={item.id}
                        className="d-flex justify-content-between align-items-center flex-wrap"
                      >
                        <div>
                          <strong>{item.fecha}</strong> — Peso: {item.peso} kg, Altura: {item.altura} m,{' '}
                          IMC: {item.imc} ({item.nivel})
                        </div>
                        <div className="d-flex gap-2 mt-2 mt-md-0">
                          <Button size="sm" variant="outline-primary" onClick={() => handleEditar(item)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleEliminar(item.id)}>
                            Eliminar
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Evaluacion;
