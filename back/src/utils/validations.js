export function validateRUT(rut) {
  // Eliminar los puntos y el guion
  const cleanRUT = rut.replace(/[.\-]/g, "");

  // Verificar que el formato sea correcto (Debe ser un número seguido de un dígito verificador)
  const rutPattern = /^\d{7,8}[0-9K]$/i;
  if (!rutPattern.test(cleanRUT)) {
    return false;
  }

  // Extraer el cuerpo y el dígito verificador
  const cuerpo = cleanRUT.slice(0, -1);
  const dv = cleanRUT.slice(-1).toUpperCase();

  // Calcular el dígito verificador usando el algoritmo estándar
  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i)) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const resto = suma % 11;
  const calculoDV =
    resto === 1 ? "K" : resto === 0 ? "0" : (11 - resto).toString();

  // Comprobar si el dígito verificador coincide con el calculado
  return dv === calculoDV;
}
