// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Inicio from './pages/Inicio';
import Nosotros from './pages/Nosotros';
import Contacto from './pages/Contacto';
import Evaluacion from './pages/Evaluacion';
import PlanDetalle from './pages/PlanDetalle';
import Privacidad from './pages/Privacidad';
import Admin from './pages/Admin';
import AdminPrecios from './pages/AdminPrecios';
import PlanRutinas from './pages/PlanRutinas';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/evaluacion" element={<Evaluacion />} />
          <Route path="/admin" element={<Admin />}>
            <Route path="precios" element={<AdminPrecios />} />
          </Route>
          <Route path="/plan-rutinas" element={<PlanRutinas />} />
          {/* Páginas de detalle de cada plan, reutilizando el mismo componente PlanDetalle */}
          <Route
            path="/plan-inicial"
            element={
              <PlanDetalle
                nombre="Inicial"
                imagen="/images/Beginner.jpg"
                colorClass="text-primary"
                caracteristicas={[
                  'Dieta personalizada',
                  'Entrenamiento personalizado',
                  'Seguimiento por WhatsApp',
                  'Revisión semanal',
                ]}
              />
            }
          />
          <Route
            path="/plan-intermedio"
            element={
              <PlanDetalle
                nombre="Intermedio"
                imagen="/images/Intermediate.jpg"
                colorClass="text-success"
                caracteristicas={[
                  'Dieta personalizada',
                  'Entrenamiento personalizado',
                  'Seguimiento por WhatsApp',
                  'Revisión semanal',
                ]}
              />
            }
          />
          <Route
            path="/plan-avanzado"
            element={
              <PlanDetalle
                nombre="Avanzado"
                imagen="/images/Advance.jpg"
                colorClass="text-danger"
                caracteristicas={[
                  'Nutrición de élite',
                  'Programación personalizada',
                  'Biofeedback y analítica',
                  'Sesiones de videollamada',
                  'Preparación puesta a punto',
                ]}
              />
            }
          />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;