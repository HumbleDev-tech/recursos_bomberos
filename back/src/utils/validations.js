/**
 * Validates a Chilean RUT (Rol Único Tributario).
 *
 * This function removes any dots and hyphens from the input RUT, verifies the format,
 * extracts the body and the check digit, and calculates the check digit using the standard algorithm.
 * It then compares the calculated check digit with the provided one to determine if the RUT is valid.
 *
 * @param {string} rut - The RUT to be validated. It can contain dots and hyphens.
 * @returns {boolean} - Returns `true` if the RUT is valid, otherwise `false`.
 */
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


/**
 * Validates if the given value is a valid float number.
 *
 * @param {string|number} value - The value to be validated.
 * @returns {string|null} - Returns an error message if the value is not a valid float or is negative, otherwise returns null.
 */
export function validateFloat(value) {
  const floatValue = parseFloat(value);
  
  if (isNaN(floatValue)) {
      return "El valor debe ser un número válido.";
  }
  
  if (floatValue < 0) {
      return "El valor no puede ser negativo.";
  }
  
  return null;
}


/**
 * Validates the structure of an email address.
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} - Returns true if the email address is valid, otherwise false.
 */
export function validateEmail(email) {
  // Expresión regular para validar la estructura del correo electrónico
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Comprobación si el email cumple con la expresión regular
  return regex.test(email);
}