import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';

const IntakeFormPublico = ({ onDatosListos, datosIniciales }) => {
  const [formData, setFormData] = useState(datosIniciales || {
    nombre: '',
    email: '',
    telefono: '',
    edad: '',
    peso: '',
    altura: '',
    meses_entrenando: '',
    nivel_experiencia: 'Principiante',
    objetivo: 'Pérdida de grasa',
    dias_disponibles: 3,
    equipamiento: 'Gimnasio completo',
    lesiones: '',
    notas: ''
  });

  const [imc, setImc] = useState(null);
  const [nivelRecomendado, setNivelRecomendado] = useState('');
  const [alerta, setAlerta] = useState(null);

  // Función para normalizar el teléfono chileno
  const normalizarTelefono = (tel) => {
    if (!tel) return '';
    // Eliminar todo lo que no sea número o '+'
    let limpio = tel.replace(/[^0-9+]/g, '');
    // Si empieza con '+56', quitamos el '+56' temporalmente
    if (limpio.startsWith('+56')) {
      limpio = limpio.substring(3);
    } else if (limpio.startsWith('56')) {
      limpio = limpio.substring(2);
    }
    // Ahora limpio tiene solo el número sin código de país
    // Si no empieza con 9, se lo agregamos (celular chileno)
    if (!limpio.startsWith('9')) {
      limpio = '9' + limpio;
    }
    // Si tiene más de 9 dígitos (ej: 995462032), tomamos los últimos 9
    if (limpio.length > 9) {
      limpio = limpio.slice(-9);
    }
    return '+56' + limpio;
  };

  // Calcular IMC
  useEffect(() => {
    const peso = parseFloat(formData.peso);
    const altura = parseFloat(formData.altura) / 100;
    if (peso > 0 && altura > 0) {
      const imcCalculado = peso / (altura * altura);
      setImc(imcCalculado.toFixed(1));
    } else {
      setImc(null);
    }
  }, [formData.peso, formData.altura]);

  // Calcular nivel recomendado
  useEffect(() => {
    const meses = parseInt(formData.meses_entrenando);
    const imcVal = parseFloat(imc);
    let recomendado = '';

    if (!isNaN(meses) && imc) {
      let nivelPorTiempo = '';
      if (meses < 6) nivelPorTiempo = 'Principiante';
      else if (meses >= 6 && meses <= 24) nivelPorTiempo = 'Intermedio';
      else nivelPorTiempo = 'Avanzado';

      let razon = '';
      if (imcVal >= 30) {
        recomendado = 'Principiante';
        razon = 'Tu IMC indica obesidad. Priorizamos salud y composición corporal antes que rendimiento.';
      } else if (imcVal >= 25) {
        recomendado = nivelPorTiempo === 'Principiante' ? 'Principiante' : 'Intermedio';
        razon = 'Tu IMC indica sobrepeso. Es ideal combinar salud con rendimiento.';
      } else if (imcVal < 18.5) {
        recomendado = nivelPorTiempo;
        razon = 'Tu IMC indica bajo peso. Enfocaremos en ganancia muscular y nutrición.';
      } else {
        recomendado = nivelPorTiempo;
        razon = 'Tu IMC está en rango saludable. El nivel se basa en tu experiencia.';
      }

      setNivelRecomendado(recomendado);

      if (formData.nivel_experiencia !== recomendado) {
        let textoPositivo = '';
        if (imcVal >= 30 || imcVal >= 25) {
          textoPositivo = `Tu perfil sugiere comenzar con el plan ${recomendado} para priorizar salud y técnica. Pero si te sientes preparado para un reto mayor, ¡vamos con todo!`;
        } else if (imcVal < 18.5) {
          textoPositivo = `Tu perfil sugiere el plan ${recomendado} para enfocarnos en ganancia muscular. Si crees que puedes más, adelante.`;
        } else {
          textoPositivo = `Tu experiencia sugiere el plan ${recomendado}. Si te sientes listo para el siguiente nivel, ¡vamos!`;
        }

        setAlerta({
          type: 'info',
          razon: razon,
          textoPositivo: textoPositivo
        });
      } else {
        setAlerta(null);
      }
    } else {
      setNivelRecomendado('');
      setAlerta(null);
    }
  }, [formData.meses_entrenando, formData.nivel_experiencia, imc]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const aceptarRecomendacion = () => {
    setFormData({ ...formData, nivel_experiencia: nivelRecomendado });
    setAlerta(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (alerta) {
      const confirmar = window.confirm(
        `Has elegido el plan ${formData.nivel_experiencia}, pero nuestra recomendación es ${nivelRecomendado}. ¿Estás seguro de continuar con tu elección?`
      );
      if (!confirmar) return;
    }

    // Normalizar el teléfono antes de enviar
    const telefonoNormalizado = normalizarTelefono(formData.telefono);

    onDatosListos({
      ...formData,
      telefono: telefonoNormalizado,
      imc: imc ? parseFloat(imc) : null,
      nivel_recomendado: nivelRecomendado
    });
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h3 className="mb-4">Cuéntanos sobre ti</h3>
        <p className="text-muted">Esta información nos ayuda a diseñar tu rutina ideal.</p>

        <Form onSubmit={handleSubmit}>
          <h5 className="mt-4 mb-3 text-primary">1. Datos Personales</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre Completo *</Form.Label>
                <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>WhatsApp *</Form.Label>
                <Form.Control
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej: 935430209 o +56935430209"
                  required
                />
                <Form.Text className="text-muted">
                  Escribe tu número con o sin +56. Lo normalizamos automáticamente.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Edad</Form.Label>
                <Form.Control type="number" name="edad" value={formData.edad} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <h5 className="mt-4 mb-3 text-primary">2. Composición Corporal</h5>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Peso (kg) *</Form.Label>
                <Form.Control type="number" name="peso" value={formData.peso} onChange={handleChange} step="0.1" required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Altura (cm) *</Form.Label>
                <Form.Control type="number" name="altura" value={formData.altura} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>IMC Calculado</Form.Label>
                <Form.Control type="text" value={imc ? `${imc} kg/m²` : '--'} readOnly className="bg-light" />
                {imc && (
                  <Form.Text className={
                    parseFloat(imc) >= 30 ? 'text-danger' :
                    parseFloat(imc) >= 25 ? 'text-warning' : 'text-success'
                  }>
                    {parseFloat(imc) >= 30 ? 'Obesidad' :
                     parseFloat(imc) >= 25 ? 'Sobrepeso' :
                     parseFloat(imc) < 18.5 ? 'Bajo peso' : 'Peso normal'}
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

          <h5 className="mt-4 mb-3 text-primary">3. Tu Experiencia</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>¿Cuántos meses llevas entrenando? *</Form.Label>
                <Form.Control type="number" name="meses_entrenando" value={formData.meses_entrenando} onChange={handleChange} placeholder="Ej: 0, 6, 18, 36" min="0" required />
                <Form.Text className="text-muted">Si nunca has entrenado, escribe 0.</Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nivel de Experiencia *</Form.Label>
                <Form.Select name="nivel_experiencia" value={formData.nivel_experiencia} onChange={handleChange}>
                  <option>Principiante</option>
                  <option>Intermedio</option>
                  <option>Avanzado</option>
                </Form.Select>
                {nivelRecomendado && (
                  <Form.Text className="text-success">
                    💡 Recomendado: <strong>{nivelRecomendado}</strong>
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

          {alerta && (
            <Alert variant="info" className="border-0 shadow-sm">
              <div className="d-flex align-items-start">
                <div className="me-3" style={{ fontSize: '2rem' }}>💪</div>
                <div className="flex-grow-1">
                  <h5 className="fw-bold mb-2">
                    {formData.nivel_experiencia === 'Avanzado' && '¡Me impresiona tu ambición!'}
                    {formData.nivel_experiencia === 'Intermedio' && '¡El desafío es tuyo!'}
                    {formData.nivel_experiencia === 'Principiante' && 'Vamos paso a paso'}
                  </h5>
                  <p className="mb-2">{alerta.textoPositivo}</p>
                  <p className="small text-muted mb-3">
                    Thomas revisará tu caso personalmente antes de diseñar tu rutina.
                    Si considera que tu elección no es la óptima, se pondrá en contacto contigo.
                  </p>
                  <Button variant="success" size="sm" onClick={aceptarRecomendacion}>
                    Prefiero la recomendación ({nivelRecomendado})
                  </Button>
                </div>
              </div>
            </Alert>
          )}

          <h5 className="mt-4 mb-3 text-primary">4. Tus Objetivos</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Objetivo Principal</Form.Label>
                <Form.Select name="objetivo" value={formData.objetivo} onChange={handleChange}>
                  <option>Pérdida de grasa</option>
                  <option>Hipertrofia</option>
                  <option>Fuerza</option>
                  <option>Resistencia</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Días Disponibles por Semana</Form.Label>
                <Form.Control type="number" name="dias_disponibles" value={formData.dias_disponibles} onChange={handleChange} min="1" max="7" />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Equipamiento Disponible</Form.Label>
                <Form.Select name="equipamiento" value={formData.equipamiento} onChange={handleChange}>
                  <option>Gimnasio completo</option>
                  <option>Mancuernas en casa</option>
                  <option>Peso corporal</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Lesiones o Condiciones</Form.Label>
                <Form.Control as="textarea" rows={2} name="lesiones" value={formData.lesiones} onChange={handleChange} placeholder="Ej: Dolor lumbar, lesión de hombro..." />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label>Notas Adicionales</Form.Label>
            <Form.Control as="textarea" rows={2} name="notas" value={formData.notas} onChange={handleChange} />
          </Form.Group>

          <Button variant="success" type="submit" size="lg" className="w-100">
            Ver mi plan recomendado
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default IntakeFormPublico;