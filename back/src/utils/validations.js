// Función para validar el RUT chileno
export function validateRUT(rut) {
    // Eliminar puntos y guion
    rut = rut.replace('.', '').replace('-', '');

    // Verificar que el RUT tenga al menos 2 caracteres (número y dígito verificador)
    if (rut.length < 2) {
        return false;
    }

    // Dividir en número del RUT y dígito verificador
    const numeroRUT = rut.slice(0, -1);
    const digitoVerificador = rut.slice(-1).toUpperCase();

    // Verificar que el número del RUT sea solo dígitos
    if (!/^\d+$/.test(numeroRUT)) {
        return false;
    }

    // Verificar que el dígito verificador sea válido (debe ser un número o 'K')
    if (!/^\d$|^K$/.test(digitoVerificador)) {
        return false;
    }

    // Calcular el dígito verificador
    let suma = 0;
    let multiplicador = 2;

    // Recorrer el número del RUT de derecha a izquierda
    for (let i = numeroRUT.length - 1; i >= 0; i--) {
        suma += parseInt(numeroRUT.charAt(i)) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    // Obtener el dígito verificador calculado
    const digitoCalculado = 11 - (suma % 11);
    let digitoFinal;

    if (digitoCalculado === 11) {
        digitoFinal = '0';
    } else if (digitoCalculado === 10) {
        digitoFinal = 'K';
    } else {
        digitoFinal = digitoCalculado.toString();
    }

    // Comparar el dígito calculado con el proporcionado
    return digitoVerificador === digitoFinal;
}