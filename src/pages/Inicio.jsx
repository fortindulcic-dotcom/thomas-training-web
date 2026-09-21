// src/pages/Inicio.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';

const Inicio = () => {
  // Componente React Controla si el Modal del "compromiso completo" está abierto o cerrado
  const [mostrarCompromiso, setMostrarCompromiso] = useState(false);

  // Componente React Función para simular el envío de WhatsApp (puedes agregar tu lógica real aquí)
  const enviarWhatsApp = () => {
    const nombre = document.getElementById('nombreInput').value;
    const mensaje = document.getElementById('mensajeInput').value;
    if (nombre && mensaje) {
      const numero = +56935430209;
      const texto = `Hola, soy ${nombre}. ${mensaje}`;
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank');
    } else {
      alert("Por favor completa nombre y mensaje");
    }
  };

  return (
    <div>
      {/* 1. Sección Hero con Video de Fondo */}
      <div className="mi-fondo-foto" style={{ position: 'relative', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', overflow: 'hidden', padding: '20px', textAlign: 'center' }}>
        <video autoPlay muted loop playsInline className="video-background" style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '100%', objectFit: 'cover', transform: 'translate(-50%, -50%)', zIndex: '0', filter: 'brightness(40%)' }}>
          {/* Asegúrate de que el video esté en public/videotemacentral.mp4 */}
          <source src="/videotemacentral.mp4" type="video/mp4" />
          Tu navegador no soporta videos.
        </video>

        <div className="hero-content" style={{ position: 'relative', zIndex: '2' }}>
          <h1 className="display-3 fw-bold">Disciplina sobre motivación. Siempre !!</h1>
          <p className="h4">Empieza Ahora !!</p>
          {/* Enlace a la página de Evaluación */}
          <Link to="/evaluacion" className="btn btn-info btn-lg mt-3 fw-bold">
            EVALÚA TU ESTADO AQUÍ
          </Link>
        </div>
      </div>

      {/* 2. Sección de Planes */}
      <div className="container text-center mt-4">
        <div className="row">
          {/* Plan Inicial */}
          <div className="col-sm-12 col-md-4 mb-4">
            <div className="border border-secondary rounded p-3 h-100">
              <h3 className="text-primary">Plan Inicial</h3>
              <p className="text-secondary">Beginners</p>
              <img src="/images/Beginner.jpg" className="img-thumbnail mb-3 w-100" alt="Plan Inicial" style={{ width: '100%' }} />
              <Link to="/plan-inicial" className="btn btn-primary w-100 fw-bold">+ Info</Link>
            </div>
          </div>

          {/* Plan Intermedio */}
          <div className="col-sm-12 col-md-4 mb-4">
            <div className="border border-secondary rounded p-3 h-100">
              <h3 className="text-success">Plan Intermedio</h3>
              <p className="text-secondary">Intermediate</p>
              <img src="/images/Intermediate.jpg" className="img-thumbnail mb-3 w-100" alt="Plan Intermedio" style={{ width: '100%' }} />
              <Link to="/plan-intermedio" className="btn btn-success w-100 fw-bold">+ Info</Link>
            </div>
          </div>

          {/* Plan Avanzado */}
          <div className="col-sm-12 col-md-4 mb-4">
            <div className="border border-secondary rounded p-3 h-100">
              <h3 className="text-danger">Plan Avanzado</h3>
              <p className="text-secondary">Advance</p>
              <img src="/images/Advance.jpg" className="img-thumbnail mb-3 w-100" alt="Plan Avanzado" style={{ width: '100%' }} />
              <Link to="/plan-avanzado" className="btn btn-danger w-100 fw-bold">+ Info</Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sección Inferior (WhatsApp y Pregunta) */}
      <div className="container mb-5">
        <div className="row">
          {/* Columna Izquierda: WhatsApp */}
          <div className="col-12 col-md-6 mt-3 p-3 text-start">
            <div className="p-3 border rounded bg-light">
              <h3>Dudas?...Hablemos por WhatsApp!!</h3>
              <div className="mb-3">
                <label htmlFor="nombreInput" className="form-label">Tu Nombre</label>
                <input type="text" className="form-control" id="nombreInput" placeholder="Arnold Schwarzenegger" />
              </div>
              <div className="mb-3">
                <label htmlFor="mensajeInput" className="form-label">Pregúntame....Yo te Respondo !!</label>
                <textarea className="form-control" id="mensajeInput" rows="3"></textarea>
              </div>
              <button type="button" className="btn btn-info w-100 text-white fw-bold" onClick={enviarWhatsApp}>
                Enviar WhatsApp
              </button>
            </div>
          </div>

          {/* Columna Derecha: Pregunta */}
          <div className="col-12 col-md-6 mt-3 p-3">
            <div className="border border-secondary-subtle rounded p-4 h-100 text-start bg-dark text-white">
              <h3 className="text-info">La Pregunta Correcta</h3>
              <h5 className="text-secondary mb-3">¿Cuanto tiempo necesito para ver cambios?</h5>
              <p style={{ fontSize: '0.95rem' }}>
                Un mes de entrenamiento es solo un saludo; no sirve para transformar a un hombre de verdad. 
                La verdadera batalla comienza después...
              </p>
              <button type="button" className="btn btn-outline-info w-100 mt-2" onClick={() => setMostrarCompromiso(true)}>
                Leer compromiso completo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal con el texto completo del "Compromiso Sagrado" */}
      <Modal show={mostrarCompromiso} onHide={() => setMostrarCompromiso(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white border-secondary">
          <Modal.Title>El Compromiso Sagrado</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <p>
            <strong>"Un mes de entrenamiento es solo un saludo; no sirve para transformar a un hombre de verdad."</strong>
          </p>
          <p>
            Las primeras semanas son para aprender técnica y que el estómago acepte el nuevo combustible.
            La verdadera batalla comienza después.
          </p>
          <p>El compromiso sagrado es de 3 meses:</p>
          <ul>
            <li><strong>Mes 1:</strong> Ajustas el sistema y dominas la técnica.</li>
            <li><strong>Mes 2:</strong> Los músculos despiertan. Hipertrofia real.</li>
            <li><strong>Mes 3:</strong> La disciplina se funde en tu alma.</li>
          </ul>
          <p className="mb-0">
            No busques atajos de oportunista; el éxito exige tiempo y voluntad inquebrantable. ¡Disciplina o nada!
          </p>
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <Button variant="outline-info" onClick={() => setMostrarCompromiso(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Inicio;