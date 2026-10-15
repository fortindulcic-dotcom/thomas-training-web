// src/utils/generarToken.js
// Genera un código aleatorio de 6 caracteres alfanuméricos en mayúsculas
// Ejemplo: "A7B3K9", "X2M8P1"
export const generarToken = () => {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin O, 0, I, 1 para evitar confusiones
  let token = '';
  for (let i = 0; i < 6; i++) {
    token += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return token;
};