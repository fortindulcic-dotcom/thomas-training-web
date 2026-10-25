// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import AdminGenerarRutina from './pages/AdminGenerarRutina';
import AdminPagosPendientes from './pages/AdminPagosPendientes';
import PlanRutinas from './pages/PlanRutinas';
import Admision from './pages/Admision';
import AdminClientes from './pages/AdminClientes';
import MiRutina from './pages/MiRutina';
import AdminEditarRutina from './pages/AdminEditarRutina';
import Renovar from './pages/Renovar';
import AdminRenovaciones from './pages/AdminRenovaciones';

// Componente separado para usar useLocation
const AppContent = () => {
  const location = useLocation();
  const esRutaAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Solo mostramos el Navbar público si NO estamos en el admin */}
      {!esRutaAdmin && <Navbar />}
      
      <div className={esRutaAdmin ? '' : 'main-content'}>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Inicio />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/evaluacion" element={<Evaluacion />} />
          <Route path="/admision" element={<Admision />} />
          <Route path="/r/:token" element={<MiRutina />} />
          <Route path="/renovar/:token" element={<Renovar />} />
          <Route path="/plan-rutinas" element={<PlanRutinas />} />

          {/* Rutas del Panel de Administración (Protegidas) */}
          <Route path="/admin" element={<Admin />}>
            <Route path="precios" element={<AdminPrecios />} />
            <Route path="generar-rutina" element={<AdminGenerarRutina />} />
            <Route path="pagos-pendientes" element={<AdminPagosPendientes />} />
            <Route path="clientes" element={<AdminClientes />} />
            <Route path="rutina/:rutinaId" element={<AdminEditarRutina />} />
            <Route path="renovaciones" element={<AdminRenovaciones />} />
          </Route>
          
          {/* Páginas de detalle de cada plan */}
          <Route path="/plan-basico" element={<PlanDetalle nombre="Básico" imagen="/images/Beginner.jpg" colorClass="text-primary" caracteristicas={['Dieta personalizada', 'Entrenamiento personalizado', 'Seguimiento por WhatsApp', 'Revisión semanal']} />} />
          <Route path="/plan-intermedio" element={<PlanDetalle nombre="Intermedio" imagen="/images/Intermediate.jpg" colorClass="text-success" caracteristicas={['Dieta personalizada', 'Entrenamiento personalizado', 'Seguimiento por WhatsApp', 'Revisión semanal']} />} />
          <Route path="/plan-avanzado" element={<PlanDetalle nombre="Avanzado" imagen="/images/Advance.jpg" colorClass="text-danger" caracteristicas={['Nutrición de élite', 'Programación personalizada', 'Biofeedback y analítica', 'Sesiones de videollamada', 'Preparación puesta a punto']} />} />
        </Routes>
      </div>

      {/* Solo mostramos el Footer público si NO estamos en el admin */}
      {!esRutaAdmin && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;