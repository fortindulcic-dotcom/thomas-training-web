// src/utils/generadorRutinas.js

// Base de datos simplificada de ejercicios
const EJERCICIOS = {
  'Pecho': {
    'Gimnasio completo': ['Press de Banca', 'Press Inclinado con Mancuernas', 'Aperturas en Polea', 'Fondos en Paralelas'],
    'Mancuernas en casa': ['Press de Banca con Mancuernas', 'Aperturas con Mancuernas', 'Flexiones'],
    'Peso corporal': ['Flexiones', 'Flexiones Inclinadas', 'Flexiones Diamante']
  },
  'Espalda': {
    'Gimnasio completo': ['Dominadas', 'Remo con Barra', 'Jalón al Pecho', 'Remo en Polea'],
    'Mancuernas en casa': ['Remo con Mancuerna a una mano', 'Pullover con Mancuerna', 'Superman'],
    'Peso corporal': ['Dominadas (si puede)', 'Remo Invertido', 'Superman']
  },
  'Piernas': {
    'Gimnasio completo': ['Sentadilla', 'Prensa de Piernas', 'Peso Muerto Rumano', 'Extensión de Cuádriceps'],
    'Mancuernas en casa': ['Sentadilla Goblet', 'Zancadas con Mancuernas', 'Peso Muerto Rumano con Mancuernas'],
    'Peso corporal': ['Sentadilla', 'Zancadas', 'Puente de Glúteo']
  },
  'Hombros': {
    'Gimnasio completo': ['Press Militar', 'Elevaciones Laterales', 'Pájaros', 'Press Arnold'],
    'Mancuernas en casa': ['Press Militar con Mancuernas', 'Elevaciones Laterales', 'Pájaros'],
    'Peso corporal': ['Flexiones Pike', 'Elevaciones Laterales (sin peso)']
  },
  'Brazos': {
    'Gimnasio completo': ['Curl de Bíceps con Barra', 'Curl Martillo', 'Extensión de Tríceps en Polea', 'Patada de Tríceps'],
    'Mancuernas en casa': ['Curl de Bíceps con Mancuernas', 'Curl Martillo', 'Extensión de Tríceps con Mancuerna'],
    'Peso corporal': ['Curl con Toalla', 'Flexiones Diamante', 'Fondos en Silla']
  }
};

// Reglas de volumen según objetivo
const REGLAS_VOLUMEN = {
  'Pérdida de grasa': { series: 3, reps: '12-15', descanso: '45 seg' },
  'Hipertrofia': { series: 4, reps: '8-12', descanso: '60-90 seg' },
  'Fuerza': { series: 5, reps: '5-8', descanso: '2-3 min' },
  'Resistencia': { series: 3, reps: '15-20', descanso: '30 seg' }
};

export const generarRutina = (cliente) => {
  const { dias_disponibles, objetivo, equipamiento, nivel_experiencia } = cliente;
  const config = REGLAS_VOLUMEN[objetivo] || REGLAS_VOLUMEN['Hipertrofia'];

  let gruposPorDia = [];
  const dias = parseInt(dias_disponibles) || 3;

  if (dias <= 2) {
    gruposPorDia = [['Pecho', 'Espalda', 'Piernas'], ['Hombros', 'Brazos']];
  } else if (dias === 3) {
    gruposPorDia = [['Pecho', 'Brazos'], ['Espalda', 'Hombros'], ['Piernas']];
  } else if (dias === 4) {
    gruposPorDia = [['Pecho', 'Brazos'], ['Espalda'], ['Piernas'], ['Hombros', 'Brazos']];
  } else {
    gruposPorDia = [['Pecho'], ['Espalda'], ['Piernas'], ['Hombros'], ['Brazos']];
  }

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const rutinaFinal = [];

  for (let i = 0; i < dias; i++) {
    const grupos = gruposPorDia[i % gruposPorDia.length];
    const dia = diasSemana[i];

    grupos.forEach(grupo => {
      const ejerciciosDisponibles = EJERCICIOS[grupo]?.[equipamiento] || [];

      const numEjercicios = nivel_experiencia === 'Principiante' ? 2 : 3;
      const seleccionados = ejerciciosDisponibles.slice(0, numEjercicios);

      seleccionados.forEach((ejercicio, index) => {
        rutinaFinal.push({
          dia_semana: dia,
          nombre: ejercicio,
          grupo_muscular: grupo,
          series: config.series,
          repeticiones: config.reps,
          peso_sugerido: '',
          notas: `Descanso: ${config.descanso}`,
          orden: index + 1
        });
      });
    });
  }

  return rutinaFinal;
};