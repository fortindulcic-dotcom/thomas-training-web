const PRECIOS_DEFAULT = {
  rutina: 20000,
  basico: 60000,
  intermedio: 90000,
  avanzado: 150000,
};

export const getPrecios = () => {
  try {
    const guardados = localStorage.getItem('preciosPlanes');
    return guardados ? JSON.parse(guardados) : PRECIOS_DEFAULT;
  } catch {
    return PRECIOS_DEFAULT;
  }
};

export const setPrecios = (nuevosPrecios) => {
  localStorage.setItem('preciosPlanes', JSON.stringify(nuevosPrecios));
};

export const resetPrecios = () => {
  localStorage.removeItem('preciosPlanes');
};