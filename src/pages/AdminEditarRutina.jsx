import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Card, Button, Badge, Alert, Spinner, Row, Col,
  Nav, Form, Table, InputGroup, Modal
} from 'react-bootstrap';
import { supabase } from '../utils/supabase';
import { generarToken } from '../utils/generarToken';

const AdminEditarRutina = () => {
  const { rutinaId } = useParams();
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [rutina, setRutina] = useState(null);
  const [ejercicios, setEjercicios] = useState([]);
  const [diaActivo, setDiaActivo] = useState('');
  const [mostrarModalLink, setMostrarModalLink] = useState(false);
  const [linkGenerado, setLinkGenerado] = useState('');
  const [urlWhatsApp, setUrlWhatsApp] = useState('');

  useEffect(() => {
    cargarRutina();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rutinaId]);

  const cargarRutina = async () => {
    setCargando(true);

    const { data: rutinaData, error: errorRutina } = await supabase
      .from('rutinas')
      .select('*')
      .eq('id', rutinaId)
      .single();

    if (errorRutina || !rutinaData) {
      setMensaje({ type: 'danger', text: 'Rutina no encontrada.' });
      setCargando(false);
      return;
    }

    const { data: clienteData } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', rutinaData.cliente_id)
      .single();

    const { data: ejerciciosData } = await supabase
      .from('ejercicios')
      .select('*')
      .eq('rutina_id', rutinaId)
      .order('dia_semana', { ascending: true })
      .order('orden', { ascending: true });

    setRutina(rutinaData);
    setCliente(clienteData);
    setEjercicios(ejerciciosData || []);

    const diasUnicos = [...new Set((ejerciciosData || []).map(e => e.dia_semana))];
    if (diasUnicos.length > 0) setDiaActivo(diasUnicos[0]);

    setCargando(false);
  };

  const diasUnicos = [...new Set(ejercicios.map(e => e.dia_semana))];
  const ejerciciosDelDia = ejercicios.filter(e => e.dia_semana === diaActivo);

  const actualizarEjercicio = (id, campo, valor) => {
    setEjercicios(prev => prev.map(e => e.id === id ? { ...e, [campo]: valor } : e));
  };

  const eliminarEjercicio = (id) => {
    if (!window.confirm('¿Eliminar este ejercicio?')) return;
    setEjercicios(prev => prev.filter(e => e.id !== id));
  };

  const agregarEjercicio = () => {
    const nuevo = {
      id: `nuevo-${Date.now()}`,
      rutina_id: rutinaId,
      dia_semana: diaActivo,
      nombre: 'Nuevo ejercicio',
      grupo_muscular: '',
      series: 3,
      repeticiones: '10-12',
      peso_sugerido: '',
      notas: '',
      orden: ejerciciosDelDia.length + 1,
      esNuevo: true
    };
    setEjercicios(prev => [...prev, nuevo]);
  };

  const moverEjercicio = (id, direccion) => {
    const lista = [...ejerciciosDelDia];
    const index = lista.findIndex(e => e.id === id);
    if (direccion === 'subir' && index > 0) {
      [lista[index - 1], lista[index]] = [lista[index], lista[index - 1]];
    } else if (direccion === 'bajar' && index < lista.length - 1) {
      [lista[index + 1], lista[index]] = [lista[index], lista[index + 1]];
    }
    const actualizados = lista.map((e, i) => ({ ...e, orden: i + 1 }));
    setEjercicios(prev => {
      const otrosDias = prev.filter(e => e.dia_semana !== diaActivo);
      return [...otrosDias, ...actualizados];
    });
  };

  const guardarCambios = async () => {
    setGuardando(true);
    setMensaje(null);

    const nuevos = ejercicios.filter(e => e.esNuevo);
    const existentes = ejercicios.filter(e => !e.esNuevo);

    for (const ej of existentes) {
      await supabase
        .from('ejercicios')
        .update({
          nombre: ej.nombre,
          grupo_muscular: ej.grupo_muscular,
          series: ej.series,
          repeticiones: ej.repeticiones,
          peso_sugerido: ej.peso_sugerido,
          notas: ej.notas,
          orden: ej.orden
        })
        .eq('id', ej.id);
    }

    if (nuevos.length > 0) {
      const nuevosLimpios = nuevos.map(({ esNuevo, id, ...resto }) => resto);
      await supabase.from('ejercicios').insert(nuevosLimpios);
    }

    const { data: enBD } = await supabase
      .from('ejercicios')
      .select('id')
      .eq('rutina_id', rutinaId);

    const idsEnEstado = ejercicios.filter(e => !e.esNuevo).map(e => e.id);
    const idsAEliminar = (enBD || [])
      .map(e => e.id)
      .filter(id => !idsEnEstado.includes(id));

    if (idsAEliminar.length > 0) {
      await supabase.from('ejercicios').delete().in('id', idsAEliminar);
    }

    setMensaje({ type: 'success', text: '✅ Cambios guardados correctamente.' });
    setGuardando(false);
    cargarRutina();
  };

  const aprobarRutina = async () => {
    if (!window.confirm('¿Aprobar esta rutina? Se generará un link único y se abrirá WhatsApp para enviárselo al cliente.')) return;

    setGuardando(true);
    setMensaje(null);

    await guardarCambios();

    let tokenFinal = rutina.token;
    if (!tokenFinal) {
      let intentos = 0;
      let tokenDisponible = false;

      while (!tokenDisponible && intentos < 10) {
        const nuevoToken = generarToken();
        const { data: existente } = await supabase
          .from('rutinas')
          .select('id')
          .eq('token', nuevoToken)
          .maybeSingle();

        if (!existente) {
          tokenFinal = nuevoToken;
          tokenDisponible = true;
        }
        intentos++;
      }

      if (!tokenDisponible) {
        setMensaje({ type: 'danger', text: 'No se pudo generar un token único. Intenta de nuevo.' });
        setGuardando(false);
        return;
      }
    }

    const hoy = new Date();
    const fechaVencimiento = new Date(hoy);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

    const { error } = await supabase
      .from('rutinas')
      .update({
        token: tokenFinal,
        estado: 'activa',
        activa: true,
        aprobada_por_thomas: true,
        fecha_aprobacion: new Date().toISOString(),
        fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0]
      })
      .eq('id', rutinaId);

    if (error) {
      setMensaje({ type: 'danger', text: 'Error al aprobar: ' + error.message });
      setGuardando(false);
      return;
    }

    const urlBase = window.location.origin;
    const link = `${urlBase}/r/${tokenFinal}`;
    setLinkGenerado(link);

    const mensajeWhatsApp = encodeURIComponent(
      `¡Hola ${cliente.nombre}! 💪\n\n` +
      `Tu rutina personalizada ya está lista. Aquí puedes consultarla todos los días desde tu celular:\n\n` +
      `${link}\n\n` +
      `📌 Guárdala en favoritos para acceder rápido.\n\n` +
      `Cualquier duda, me escribes. ¡A darle con todo! 🔥\n\n` +
      `— Thomas Fortin`
    );

    const telefono = cliente.telefono.replace(/\D/g, '');
    const urlWA = `https://wa.me/${telefono}?text=${mensajeWhatsApp}`;
    setUrlWhatsApp(urlWA);

    // Intentar abrir WhatsApp automáticamente (puede ser bloqueado por el navegador)
    const ventanaWhatsApp = window.open(urlWA, '_blank');
    if (!ventanaWhatsApp) {
      console.warn('El navegador bloqueó la ventana de WhatsApp. Usa el botón del modal.');
    }

    setMostrarModalLink(true);
    setGuardando(false);
    cargarRutina();
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(linkGenerado);
    alert('✅ Link copiado al portapapeles');
  };

  if (cargando) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Cargando rutina...</p>
      </Container>
    );
  }

  if (!rutina || !cliente) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{mensaje?.text || 'Rutina no encontrada.'}</Alert>
        <Button variant="secondary" onClick={() => navigate('/admin/generar-rutina')}>
          ← Volver
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="p-3 p-lg-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
        <div>
          <Button variant="outline-secondary" size="sm" onClick={() => navigate('/admin/generar-rutina')}>
            ← Volver
          </Button>
          <h4 className="fw-bold mb-0 mt-2">📝 Rutina de {cliente.nombre}</h4>
          <small className="text-muted">
            Plan {cliente.nivel_experiencia} | {cliente.telefono}
          </small>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Badge bg={rutina.estado === 'activa' ? 'success' : 'warning'} text={rutina.estado === 'activa' ? 'white' : 'dark'} className="p-2">
            {rutina.estado === 'activa' ? '✅ Activa' : '📝 Borrador'}
          </Badge>
          {rutina.token && (
            <Badge bg="info" className="p-2">🔗 Token: {rutina.token}</Badge>
          )}
        </div>
      </div>

      {mensaje && <Alert variant={mensaje.type}>{mensaje.text}</Alert>}

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="p-3">
          <Row className="text-center g-2">
            <Col xs={6} md={3}>
              <small className="text-muted d-block">Objetivo</small>
              <strong style={{ fontSize: '0.9rem' }}>{cliente.objetivo}</strong>
            </Col>
            <Col xs={6} md={3}>
              <small className="text-muted d-block">IMC</small>
              <strong>{cliente.imc || '-'}</strong>
            </Col>
            <Col xs={6} md={3}>
              <small className="text-muted d-block">Días/semana</small>
              <strong>{cliente.dias_disponibles}</strong>
            </Col>
            <Col xs={6} md={3}>
              <small className="text-muted d-block">Vence</small>
              <strong>{rutina.fecha_vencimiento ? new Date(rutina.fecha_vencimiento).toLocaleDateString('es-CL') : 'Sin asignar'}</strong>
            </Col>
          </Row>
          {cliente.lesiones && (
            <Alert variant="warning" className="mt-2 mb-0 py-2">
              <small>⚠️ <strong>Lesiones:</strong> {cliente.lesiones}</small>
            </Alert>
          )}
        </Card.Body>
      </Card>

      <Nav variant="pills" className="mb-3 flex-nowrap overflow-auto">
        {diasUnicos.map(dia => (
          <Nav.Item key={dia} className="me-1">
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

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0">{diaActivo} ({ejerciciosDelDia.length} ejercicios)</h6>
            <Button variant="primary" size="sm" onClick={agregarEjercicio}>
              + Agregar ejercicio
            </Button>
          </div>

          <div className="table-responsive">
            <Table bordered hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th style={{ minWidth: '180px' }}>Ejercicio</th>
                  <th style={{ minWidth: '110px' }}>Músculo</th>
                  <th style={{ width: '70px' }}>Series</th>
                  <th style={{ width: '90px' }}>Reps</th>
                  <th style={{ width: '100px' }}>Peso</th>
                  <th style={{ minWidth: '150px' }}>Notas</th>
                  <th style={{ width: '110px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ejerciciosDelDia.map((ej, idx) => (
                  <tr key={ej.id}>
                    <td className="text-center">
                      <div className="d-flex flex-column gap-1">
                        <Button size="sm" variant="outline-secondary" style={{ padding: '0 4px', fontSize: '0.7rem' }} onClick={() => moverEjercicio(ej.id, 'subir')} disabled={idx === 0}>
                          ▲
                        </Button>
                        <Button size="sm" variant="outline-secondary" style={{ padding: '0 4px', fontSize: '0.7rem' }} onClick={() => moverEjercicio(ej.id, 'bajar')} disabled={idx === ejerciciosDelDia.length - 1}>
                          ▼
                        </Button>
                      </div>
                    </td>
                    <td>
                      <Form.Control size="sm" value={ej.nombre} onChange={(e) => actualizarEjercicio(ej.id, 'nombre', e.target.value)} />
                    </td>
                    <td>
                      <Form.Control size="sm" value={ej.grupo_muscular || ''} onChange={(e) => actualizarEjercicio(ej.id, 'grupo_muscular', e.target.value)} />
                    </td>
                    <td>
                      <Form.Control size="sm" type="number" value={ej.series} onChange={(e) => actualizarEjercicio(ej.id, 'series', parseInt(e.target.value) || 0)} />
                    </td>
                    <td>
                      <Form.Control size="sm" value={ej.repeticiones} onChange={(e) => actualizarEjercicio(ej.id, 'repeticiones', e.target.value)} />
                    </td>
                    <td>
                      <Form.Control size="sm" placeholder="Ej: 50 kg" value={ej.peso_sugerido || ''} onChange={(e) => actualizarEjercicio(ej.id, 'peso_sugerido', e.target.value)} />
                    </td>
                    <td>
                      <Form.Control size="sm" value={ej.notas || ''} onChange={(e) => actualizarEjercicio(ej.id, 'notas', e.target.value)} />
                    </td>
                    <td className="text-center">
                      <Button size="sm" variant="outline-danger" onClick={() => eliminarEjercicio(ej.id)}>🗑️</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {ejerciciosDelDia.length === 0 && (
            <p className="text-center text-muted py-4 mb-0">
              No hay ejercicios para este día. Haz clic en "+ Agregar ejercicio".
            </p>
          )}
        </Card.Body>
      </Card>

      <div className="d-flex gap-2 flex-wrap justify-content-end">
        <Button variant="outline-primary" onClick={guardarCambios} disabled={guardando}>
          {guardando ? 'Guardando...' : '💾 Guardar cambios'}
        </Button>
        <Button variant="success" onClick={aprobarRutina} disabled={guardando || rutina.estado === 'activa'}>
          {rutina.estado === 'activa' ? '✅ Rutina ya aprobada' : '✅ Aprobar y enviar por WhatsApp'}
        </Button>
      </div>

      <Modal show={mostrarModalLink} onHide={() => setMostrarModalLink(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>🎉 ¡Rutina aprobada y enviada!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>La rutina de <strong>{cliente.nombre}</strong> está activa.</p>
          <p className="mb-2">Link público para el cliente:</p>
          <InputGroup className="mb-3">
            <Form.Control value={linkGenerado} readOnly />
            <Button variant="primary" onClick={copiarLink}>📋 Copiar</Button>
          </InputGroup>

          <Button
            variant="success"
            size="lg"
            className="w-100"
            href={urlWhatsApp}
            target="_blank"
            rel="noreferrer"
          >
            💬 Abrir WhatsApp y enviar
          </Button>

          <small className="text-muted d-block mt-3">
            Si WhatsApp no se abrió automáticamente, usa este botón. El link es único para {cliente.nombre} y expira el {rutina.fecha_vencimiento ? new Date(rutina.fecha_vencimiento).toLocaleDateString('es-CL') : '—'}.
          </small>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminEditarRutina;