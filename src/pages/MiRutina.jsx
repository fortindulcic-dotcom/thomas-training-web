import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Alert, Spinner, Button, Nav } from 'react-bootstrap';
import { supabase } from '../utils/supabase';

const MiRutina = () => {
  const { token } = useParams();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [rutina, setRutina] = useState(null);
  const [ejercicios, setEjercicios] = useState([]);
  const [diaActivo, setDiaActivo] = useState('');
  const [ejerciciosCompletados, setEjerciciosCompletados] = useState({});

  useEffect(() => {
    cargarRutina();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const cargarRutina = async () => {
    setCargando(true);
    setError(null);

    // Buscar la rutina por token
    const { data: rutinaData, error: errorRutina } = await supabase
      .from('rutinas')
      .select('*')
      .eq('token', token.toUpperCase())
      .single();

    if (errorRutina || !rutinaData) {
      setError('Rutina no encontrada. Verifica el link.');
      setCargando(false);
      return;
    }

    // Verificar vencimiento
    if (rutinaData.fecha_vencimiento) {
      const hoy = new Date();
      const vencimiento = new Date(rutinaData.fecha_vencimiento);
      if (hoy > vencimiento) {
        setError(`Tu plan venció el ${vencimiento.toLocaleDateString('es-CL')}. Contacta a Thomas para renovar.`);
        setCargando(false);
        return;
      }
    }

    // Cargar cliente
    const { data: clienteData } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', rutinaData.cliente_id)
      .single();

    // Cargar ejercicios
    const { data: ejerciciosData } = await supabase
      .from('ejercicios')
      .select('*')
      .eq('rutina_id', rutinaData.id)
      .order('orden', { ascending: true });

    setRutina(rutinaData);
    setCliente(clienteData);
    setEjercicios(ejerciciosData || []);

    // Establecer el primer día como activo
    const diasUnicos = [...new Set((ejerciciosData || []).map(e => e.dia_semana))];
    if (diasUnicos.length > 0) setDiaActivo(diasUnicos[0]);

    // Cargar estado de completados desde localStorage
    const guardados = JSON.parse(localStorage.getItem(`rutina_${token}`) || '{}');
    setEjerciciosCompletados(guardados);

    setCargando(false);
  };

  const toggleCompletado = (ejercicioId) => {
    const nuevos = { ...ejerciciosCompletados, [ejercicioId]: !ejerciciosCompletados[ejercicioId] };
    setEjerciciosCompletados(nuevos);
    localStorage.setItem(`rutina_${token}`, JSON.stringify(nuevos));
  };

  const enviarWhatsApp = () => {
    const mensaje = encodeURIComponent(`Hola Thomas! Te escribo desde mi rutina (${cliente?.nombre}).`);
    window.open(`https://wa.me/56995484848?text=${mensaje}`, '_blank');
  };

  if (cargando) {
    return (
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="info" />
          <p className="mt-3">Cargando tu rutina...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5" style={{ maxWidth: '500px' }}>
        <Card className="border-0 shadow">
          <Card.Body className="text-center p-5">
            <div style={{ fontSize: '4rem' }}>🔒</div>
            <h3 className="fw-bold mt-3">Acceso restringido</h3>
            <p className="text-muted">{error}</p>
            <Button variant="info" className="mt-3" onClick={enviarWhatsApp}>
              💬 Contactar a Thomas
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Agrupar ejercicios por día
  const diasUnicos = [...new Set(ejercicios.map(e => e.dia_semana))];
  const ejerciciosDelDia = ejercicios.filter(e => e.dia_semana === diaActivo);
  const totalDia = ejerciciosDelDia.length;
  const completadosDia = ejerciciosDelDia.filter(e => ejerciciosCompletados[e.id]).length;
  const progresoDia = totalDia > 0 ? Math.round((completadosDia / totalDia) * 100) : 0;

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #1a1f36 0%, #2d3350 100%)', color: 'white', padding: '20px 0' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold mb-1" style={{ letterSpacing: '1px' }}>💪 TFCOACHING</h5>
              <small className="text-white-50">Rutina de {cliente?.nombre}</small>
            </div>
            <Badge bg="info">Semana {rutina.semana_actual || 1}</Badge>
          </div>
        </Container>
      </div>

      <Container className="mt-3">
        {/* INFO DEL CLIENTE */}
        <Card className="border-0 shadow-sm mb-3">
          <Card.Body className="p-3">
            <Row className="text-center">
              <Col>
                <small className="text-muted d-block">Plan</small>
                <Badge bg="primary">{cliente?.nivel_experiencia}</Badge>
              </Col>
              <Col>
                <small className="text-muted d-block">Objetivo</small>
                <strong style={{ fontSize: '0.85rem' }}>{cliente?.objetivo}</strong>
              </Col>
              <Col>
                <small className="text-muted d-block">Vence</small>
                <strong style={{ fontSize: '0.85rem' }}>
                  {rutina.fecha_vencimiento ? new Date(rutina.fecha_vencimiento).toLocaleDateString('es-CL') : '-'}
                </strong>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* NAVEGACIÓN POR DÍAS */}
        <Nav variant="pills" className="mb-3 justify-content-center flex-nowrap overflow-auto">
          {diasUnicos.map(dia => (
            <Nav.Item key={dia} className="mx-1">
              <Nav.Link
                active={diaActivo === dia}
                onClick={() => setDiaActivo(dia)}
                style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {dia}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        {/* PROGRESO DEL DÍA */}
        <Card className="border-0 shadow-sm mb-3">
          <Card.Body className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>{diaActivo}</strong>
              <Badge bg={progresoDia === 100 ? 'success' : 'primary'}>
                {completadosDia} / {totalDia} completados
              </Badge>
            </div>
            <div className="progress" style={{ height: '8px' }}>
              <div
                className="progress-bar"
                style={{ width: `${progresoDia}%`, background: progresoDia === 100 ? '#43e97b' : '#667eea' }}
              ></div>
            </div>
          </Card.Body>
        </Card>

        {/* EJERCICIOS */}
        {ejerciciosDelDia.map((ejercicio, idx) => {
          const completado = ejerciciosCompletados[ejercicio.id];
          return (
            <Card
              key={ejercicio.id}
              className="border-0 shadow-sm mb-2"
              style={{
                opacity: completado ? 0.6 : 1,
                borderLeft: completado ? '4px solid #43e97b' : '4px solid #667eea',
                transition: 'all 0.2s'
              }}
            >
              <Card.Body className="p-3">
                <div className="d-flex align-items-start">
                  <div
                    onClick={() => toggleCompletado(ejercicio.id)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: completado ? 'none' : '2px solid #667eea',
                      background: completado ? '#43e97b' : 'transparent',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      marginRight: '12px',
                      fontSize: '18px'
                    }}
                  >
                    {completado && '✓'}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong style={{ fontSize: '1rem' }}>{ejercicio.nombre}</strong>
                        <Badge bg="secondary" className="ms-2" style={{ fontSize: '0.7rem' }}>
                          {ejercicio.grupo_muscular}
                        </Badge>
                      </div>
                      <small className="text-muted">#{idx + 1}</small>
                    </div>
                    <div className="d-flex gap-3 mt-2 flex-wrap">
                      <span>🎯 <strong>{ejercicio.series}</strong> series</span>
                      <span>🔁 <strong>{ejercicio.repeticiones}</strong> reps</span>
                      {ejercicio.peso_sugerido && (
                        <span>🏋️ <strong>{ejercicio.peso_sugerido}</strong></span>
                      )}
                    </div>
                    {ejercicio.notas && (
                      <small className="text-muted d-block mt-2">💡 {ejercicio.notas}</small>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          );
        })}
      </Container>

      {/* BOTÓN FLOTANTE DE WHATSAPP */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <Button
          variant="success"
          size="lg"
          className="rounded-circle shadow"
          style={{ width: '60px', height: '60px', padding: 0 }}
          onClick={enviarWhatsApp}
        >
          💬
        </Button>
      </div>
    </div>
  );
};

export default MiRutina;