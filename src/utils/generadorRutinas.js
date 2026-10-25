// src/utils/generadorRutinas.js

export const BIBLIOTECA = {
  'Gimnasio completo': {
    Principiante: {
      empuje: [
        { nombre: 'Plano Banca', grupo: 'Pecho', series: 3, reps: '3-5', notas: 'rest-3min' },
        { nombre: 'Inclinado mancuernas', grupo: 'Pecho', series: 3, reps: '6-8', notas: 'rest-2min' },
        { nombre: 'Inclinado maquina press', grupo: 'Pecho', series: 3, reps: '15-20', notas: 'rest-2min' },
        { nombre: 'Dips al fallo', grupo: 'Pecho/Tríceps', series: 3, reps: 'Fallo', notas: 'rest-2min' },
        { nombre: 'Extension tricep polea', grupo: 'Tríceps', series: 3, reps: '15-20', notas: 'rest-2min' },
        { nombre: 'Skullcrushers barra', grupo: 'Tríceps', series: 3, reps: '6-8', notas: 'rest-2min' },
        { nombre: 'Press militar smith', grupo: 'Hombro', series: 3, reps: '6-8', notas: 'rest-2min' },
        { nombre: 'Laterales mancuernas', grupo: 'Hombro', series: 3, reps: '15-20', notas: 'rest-2min' }
      ],
      jalon: [
        { nombre: 'Rows con barra', grupo: 'Espalda', series: 3, reps: '6-8', notas: 'rest-3min' },
        { nombre: 'Remo en T o maquina', grupo: 'Espalda', series: 3, reps: '15-20', notas: 'rest-2min' },
        { nombre: 'Pull over polea alta', grupo: 'Espalda', series: 3, reps: '15-20', notas: 'rest-2min' },
        { nombre: 'Jalon al pecho agarre inverso', grupo: 'Espalda', series: 3, reps: '15-20', notas: 'rest-2min' },
        { nombre: 'Curl bicep barra', grupo: 'Bíceps', series: 3, reps: '6-8', notas: 'rest-2min' },
        { nombre: 'Curl banco Scott', grupo: 'Bíceps', series: 3, reps: '15-20', notas: 'rest-2min' },
        { nombre: 'Hammer curls', grupo: 'Bíceps', series: 3, reps: '15-20', notas: 'rest-2min' }
      ],
      pierna: [
        { nombre: 'Squats', grupo: 'Piernas', series: 3, reps: '6-8', notas: 'rest-3min' },
        { nombre: 'Prensa abierta', grupo: 'Piernas', series: 3, reps: '6-8', notas: 'rest-2min' },
        { nombre: 'Extension cuadriceps', grupo: 'Piernas', series: 3, reps: '15-20', notas: 'rest-2min' },
        { nombre: 'Peso muerto Rumano', grupo: 'Femoral', series: 3, reps: '6-8', notas: 'rest-3min' },
        { nombre: 'Camilla femoral', grupo: 'Femoral', series: 3, reps: '15-20', notas: 'rest-2min' },
        { nombre: 'Calf raise', grupo: 'Pantorrilla', series: 3, reps: '20-25', notas: 'rest-1:30' }
      ]
    },
    Intermedio: {
      empuje: [
        { nombre: 'Incline Press mancuernas', grupo: 'Pecho', series: 3, reps: '6-8', notas: 'ultima serie 2 rest pause failure / rest-3min' },
        { nombre: 'Incline Chest press', grupo: 'Pecho', series: 2, reps: '15-20', notas: 'negative reps al final / rest-2min' },
        { nombre: 'Press Plano barra', grupo: 'Pecho', series: 2, reps: '6-8', notas: 'rest-3min' },
        { nombre: 'Dips', grupo: 'Pecho/Tríceps', series: 3, reps: 'Fallo', notas: 'rest-2min' },
        { nombre: 'Laterales sentado', grupo: 'Hombro', series: 5, reps: '15-20', notas: 'rest-2min' },
        { nombre: 'Posterior en maquina', grupo: 'Hombro', series: 2, reps: '15-20', notas: 'rest-2min' },
        { nombre: 'Row con barra', grupo: 'Espalda', series: 2, reps: '6-8', notas: 'rest-2min' },
        { nombre: 'Row en maquina sentado', grupo: 'Espalda', series: 3, reps: '15-20', notas: 'ultima serie 2 rest pause / rest-2min' }
      ],
      jalon: [
        { nombre: 'Dominadas al fallo', grupo: 'Espalda', series: 2, reps: 'Fallo', notas: 'rest-2min' },
        { nombre: 'Hammer curls', grupo: 'Bíceps', series: 5, reps: '15', notas: 'rest-2min' },
        { nombre: 'Banco Scott maquina agarre cerrado', grupo: 'Bíceps', series: 5, reps: '15-20', notas: 'ultimo set 2 rest pause failure / rest-2min (buena tecnica)' },
        { nombre: 'Curl con barra agarre abierto', grupo: 'Bíceps', series: 3, reps: '6-8', notas: 'rest-3min (raw sets)' },
        { nombre: 'Curl banco Scott a un brazo', grupo: 'Bíceps', series: 2, reps: '15-20', notas: 'rest-2min (burn)' },
        { nombre: 'Press cerrado banca', grupo: 'Tríceps', series: 3, reps: '6-8', notas: 'rest-2min' },
        { nombre: 'Skull crushers', grupo: 'Tríceps', series: 5, reps: '6-8', notas: 'rest-3min (stretch and raw)' },
        { nombre: 'Tricep pushdown barra', grupo: 'Tríceps', series: 5, reps: '15-20', notas: 'rest-3min' },
        { nombre: 'Pushdown X en polea alta', grupo: 'Tríceps', series: 3, reps: '15-20', notas: 'rest-2min (perfect technique)' }
      ],
      pierna: [
        { nombre: 'Extension de cuadriceps', grupo: 'Piernas', series: 2, reps: '20 (calentamiento)', notas: 'muy liviano' },
        { nombre: 'Extension de cuadriceps (trabajo)', grupo: 'Piernas', series: 1, reps: '15', notas: 'peso medio aguantando 1 tiempo arriba / rest-2min' },
        { nombre: 'Sentadilla smith', grupo: 'Piernas', series: 2, reps: '1-5', notas: 'rest-3min' },
        { nombre: 'Hack squat', grupo: 'Piernas', series: 1, reps: '15-20', notas: 'rest-3min' },
        { nombre: 'Extension cuadriceps', grupo: 'Piernas', series: 2, reps: '15-20', notas: 'rest-2min' },
        { nombre: 'Prensa posicion abierta', grupo: 'Piernas', series: 1, reps: '6-8', notas: 'rest-3min' },
        { nombre: 'Adductores', grupo: 'Piernas', series: 2, reps: '15-20', notas: 'rest-2min' },
        { nombre: 'Calve raise', grupo: 'Pantorrilla', series: 3, reps: '15-20', notas: 'rest-1:30' }
      ]
    },
    Avanzado: {
      empuje: [
        { nombre: 'Extensión de cuádriceps', grupo: 'Piernas', series: 2, reps: '12-15', notas: 'pies mirando hacia afuera / rest-2min' },
        { nombre: 'Leg press en maquina', grupo: 'Piernas', series: 2, reps: '8-12', notas: 'pies en posición abierta / rest-2min' },
        { nombre: 'Sentadilla smith', grupo: 'Piernas', series: 3, reps: '6-8', notas: 'rest-3min' },
        { nombre: 'Peso muerto rumano en barra libre', grupo: 'Femoral', series: 3, reps: '8-12', notas: 'rest-2min' },
        { nombre: 'Femoral sentado', grupo: 'Femoral', series: 2, reps: '12-15', notas: 'ultimo set rest pause fallo / rest-2min' },
        { nombre: 'Calves en Viking press', grupo: 'Pantorrilla', series: 2, reps: '25', notas: 'ritmo lento a rapido hasta llegar a 25 / rest-1min' }
      ],
      jalon: [
        { nombre: 'Press inclinado con barra', grupo: 'Pecho', series: 2, reps: '6-8', notas: 'pesadas / rest-2min' },
        { nombre: 'Press Inclinado con mancuernas', grupo: 'Pecho', series: 2, reps: '8-12', notas: 'rest-2min' },
        { nombre: 'Press Plano maquina Panatta', grupo: 'Pecho', series: 3, reps: '12-15', notas: 'ultima serie dropset fallo / rest-2min' },
        { nombre: 'Cruce polea alta', grupo: 'Pecho', series: 2, reps: '15-20', notas: 'rest-2min' },
        { nombre: 'Dips fallo', grupo: 'Pecho/Tríceps', series: 2, reps: 'Fallo', notas: 'rest-2min' },
        { nombre: 'Skullcrushers', grupo: 'Tríceps', series: 5, reps: '12-15', notas: 'rest-2min' }
      ],
      pierna: [
        { nombre: 'Pull over polea alta', grupo: 'Espalda', series: 2, reps: '15-20', notas: 'ultimo set rest-0 / rest-1:30' },
        { nombre: 'Remo en plataforma', grupo: 'Espalda', series: 2, reps: '12-15', notas: 'rest-2min' },
        { nombre: 'Remo en barra agarre amplio', grupo: 'Espalda', series: 3, reps: '6-8', notas: 'rest-2min' },
        { nombre: 'Remo en maquina panatta', grupo: 'Espalda', series: 2, reps: '12-15', notas: '1 brazo ultimo set rest pause / rest-2min' },
        { nombre: 'Jalon al pecho en polea', grupo: 'Espalda', series: 2, reps: '12-15', notas: 'rest-2min' },
        { nombre: 'Curl de bicep acostado', grupo: 'Bíceps', series: 5, reps: '15-20', notas: 'rest-1:30' },
        { nombre: 'Laterales sentado x Posterior en Banca', grupo: 'Hombro', series: 3, reps: '15-20', notas: 'rest-1:30' }
      ]
    }
  },
  // (Aquí irían los arrays para 'Mancuernas en casa' y 'Peso corporal' en el futuro)
};

// 2. LÓGICA DE GENERACIÓN
export const generarRutina = (cliente) => {
  const { dias_disponibles, nivel_experiencia, equipamiento, lesiones } = cliente;
  
  const dias = parseInt(dias_disponibles) || 3;
  const equipoKey = equipamiento || 'Gimnasio completo';
  let nivelKey = 'Principiante';
  if (nivel_experiencia?.toLowerCase().includes('intermedio')) nivelKey = 'Intermedio';
  if (nivel_experiencia?.toLowerCase().includes('avanzado')) nivelKey = 'Avanzado';
  
  // Si el equipamiento no está en la biblioteca, usamos Gimnasio completo por defecto
  const equipoData = BIBLIOTECA[equipoKey] || BIBLIOTECA['Gimnasio completo'];
  const nivelData = equipoData[nivelKey] || equipoData['Principiante'];
  
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  let rutinaFinal = [];
  let split = [];

  // Filtro de lesiones
  const evitarLesion = (ejercicio) => {
    if (!lesiones) return false;
    const l = lesiones.toLowerCase();
    const g = ejercicio.grupo.toLowerCase();
    
    if (l.includes('hombro') && g.includes('hombro')) return true;
    if (l.includes('rodilla') && (g.includes('pierna') || ejercicio.nombre.toLowerCase().includes('squat') || ejercicio.nombre.toLowerCase().includes('prensa'))) return true;
    if (l.includes('espalda') && g.includes('espalda')) return true;
    return false;
  };

  // Filtrar los arrays
  const empujeFiltrado = nivelData.empuje.filter(e => !evitarLesion(e));
  const jalonFiltrado = nivelData.jalon.filter(e => !evitarLesion(e));
  const piernaFiltrado = nivelData.pierna.filter(e => !evitarLesion(e));

  // DISTRIBUCIÓN SEGÚN DÍAS
  if (dias <= 2) {
    split = [
      { dia: diasSemana[0], ejercicios: [...empujeFiltrado.slice(0, 3), ...jalonFiltrado.slice(0, 3), ...piernaFiltrado.slice(0, 2)] },
      { dia: diasSemana[2], ejercicios: [...piernaFiltrado.slice(2, 5), ...empujeFiltrado.slice(3, 6), ...jalonFiltrado.slice(3, 6)] }
    ];
  } else if (dias === 3) {
    split = [
      { dia: diasSemana[0], ejercicios: empujeFiltrado },
      { dia: diasSemana[2], ejercicios: jalonFiltrado },
      { dia: diasSemana[4], ejercicios: piernaFiltrado }
    ];
  } else if (dias === 4) {
    split = [
      { dia: diasSemana[0], ejercicios: empujeFiltrado.slice(0, 4) },
      { dia: diasSemana[1], ejercicios: piernaFiltrado.slice(0, 4) },
      { dia: diasSemana[3], ejercicios: jalonFiltrado.slice(0, 4) },
      { dia: diasSemana[4], ejercicios: piernaFiltrado.slice(2, 6) }
    ];
  } else {
    split = [
      { dia: diasSemana[0], ejercicios: empujeFiltrado.slice(0, 4) },
      { dia: diasSemana[1], ejercicios: jalonFiltrado.slice(0, 4) },
      { dia: diasSemana[2], ejercicios: piernaFiltrado.slice(0, 4) },
      { dia: diasSemana[3], ejercicios: [...empujeFiltrado.slice(4, 6), ...jalonFiltrado.slice(4, 6)] },
      { dia: diasSemana[4], ejercicios: piernaFiltrado.slice(2, 6) }
    ];
  }

  // FORMATEAR PARA LA BASE DE DATOS
  split.forEach(diaObj => {
    diaObj.ejercicios.forEach((ej, index) => {
      rutinaFinal.push({
        dia_semana: diaObj.dia,
        nombre: ej.nombre,
        grupo_muscular: ej.grupo,
        series: ej.series,
        repeticiones: ej.reps,
        peso_sugerido: 'A definir',
        notas: ej.notas, 
        orden: index + 1
      });
    });
  });

  return rutinaFinal;
};