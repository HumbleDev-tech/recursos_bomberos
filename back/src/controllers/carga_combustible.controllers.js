import { pool } from "../db.js";
import {
    uploadFileToS3,
    updateImageUrlInDb,
    handleError
} from '../utils/fileUpload.js';
import { validateFloat } from "../utils/validations.js";


// Obtener todas las cargas de combustible
export const getCargasCombustible = async (req, res) => {
    try {
        const query = `
            SELECT cc.id, cc.bitacora_id, cc.litros, cc.valor_mon, cc.img_url, cc.isDeleted,
                   b.compania_id, c.nombre as compania, 
                   p.rut as conductor_rut, p.nombre as conductor_nombre, p.apellido as conductor_apellido,
                   b.direccion, 
                   DATE_FORMAT(b.fh_salida, '%d-%m-%Y %H:%i') as h_salida,
                   DATE_FORMAT(b.fh_llegada, '%d-%m-%Y %H:%i') as h_llegada
            FROM carga_combustible cc
            INNER JOIN bitacora b ON cc.bitacora_id = b.id
            INNER JOIN compania c ON b.compania_id = c.id
            INNER JOIN personal p ON b.personal_id = p.id
            WHERE cc.isDeleted = 0
        `;
        
        const [rows] = await pool.query(query);
        const result = rows.map(row => ({
            id: row.id,
            bitacora: {
                id: row.bitacora_id,
                compania: row.compania,
                conductor_rut: row.conductor_rut,
                conductor_nombre: row.conductor_nombre,
                conductor_apellido: row.conductor_apellido,
                direccion: row.direccion,
                h_salida: row.h_salida,
                h_llegada: row.h_llegada,
            },
            litros: row.litros,
            valor_mon: row.valor_mon,
            img_url: row.img_url,
        }));
        res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

// con parámetros de búsqueda 
// Paginacion
export const getCargaCombustibleDetailsSearch = async (req, res) => {
    try {
        const { page, pageSize } = req.query;

        // Inicializar la consulta SQL base
        let query = `
            SELECT
                cc.id AS 'id',
                b.id AS 'bitacora.id',
                b.direccion AS 'bitacora.direccion',
                DATE_FORMAT(b.fh_salida, '%d-%m-%Y %H:%i') AS 'bitacora.fh_salida',
                DATE_FORMAT(b.fh_llegada, '%d-%m-%Y %H:%i') AS 'bitacora.fh_llegada',
                b.km_salida AS 'bitacora.km_salida',
                b.km_llegada AS 'bitacora.km_llegada',
                b.hmetro_salida AS 'bitacora.hmetro_salida',
                b.hmetro_llegada AS 'bitacora.hmetro_llegada',
                b.hbomba_salida AS 'bitacora.hbomba_salida',
                b.hbomba_llegada AS 'bitacora.hbomba_llegada',
                b.obs AS 'bitacora.obs',
                cc.litros,
                cc.valor_mon,
                cc.img_url
            FROM carga_combustible cc
            INNER JOIN bitacora b ON cc.bitacora_id = b.id
            WHERE cc.isDeleted = 0 AND b.isDeleted = 0
        `;

        // Array para almacenar los parámetros a inyectar
        const params = [];

        // Si se proporciona "page", se aplica paginación
        if (page) {
            const currentPage = parseInt(page) || 1; // Página actual, por defecto 1
            const currentPageSize = parseInt(pageSize) || 10; // Página tamaño, por defecto 10
            const offset = (currentPage - 1) * currentPageSize; // Calcular el offset para la consulta

            // Añadir LIMIT y OFFSET a la consulta
            query += ' LIMIT ? OFFSET ?';
            params.push(currentPageSize, offset);
        }

        // Ejecutar la consulta con los parámetros
        const [rows] = await pool.query(query, params);

        // Mapeo de resultados a la estructura deseada
        const result = rows.map(row => ({
            id: row.id,
            'bitacora.id': row['bitacora.id'],
            'bitacora.direccion': row['bitacora.direccion'],
            'bitacora.fh_salida': row['bitacora.fh_salida'],
            'bitacora.fh_llegada': row['bitacora.fh_llegada'],
            'bitacora.km_salida': row['bitacora.km_salida'],
            'bitacora.km_llegada': row['bitacora.km_llegada'],
            'bitacora.hmetro_salida': row['bitacora.hmetro_salida'],
            'bitacora.hmetro_llegada': row['bitacora.hmetro_llegada'],
            'bitacora.hbomba_salida': row['bitacora.hbomba_salida'],
            'bitacora.hbomba_llegada': row['bitacora.hbomba_llegada'],
            'bitacora.obs': row['bitacora.obs'],
            litros: row.litros,
            valor_mon: row.valor_mon,
            img_url: row.img_url
        }));

        // Responder con los resultados formateados
        res.json(result);

    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message,
        });
    }
};

// Obtener carga de combustible por ID
export const getCargaCombustibleByID = async (req, res) => {
    const { id } = req.params;
    try {
        const idNumber = parseInt(id);
        if (isNaN(idNumber)) {
            return res.status(400).json({ message: "Tipo de datos inválido" });
        }

        const query = `
            SELECT 
                cc.id AS 'id',
                b.id AS 'bitacora.id',
                b.direccion AS 'bitacora.direccion',
                DATE_FORMAT(b.fh_salida, '%d-%m-%Y %H:%i') AS 'bitacora.fh_salida',
                DATE_FORMAT(b.fh_llegada, '%d-%m-%Y %H:%i') AS 'bitacora.fh_llegada',
                b.km_salida AS 'bitacora.km_salida',
                b.km_llegada AS 'bitacora.km_llegada',
                b.hmetro_salida AS 'bitacora.hmetro_salida',
                b.hmetro_llegada AS 'bitacora.hmetro_llegada',
                b.hbomba_salida AS 'bitacora.hbomba_salida',
                b.hbomba_llegada AS 'bitacora.hbomba_llegada',
                b.obs AS 'bitacora.obs',
                cc.litros,
                cc.valor_mon,
                cc.img_url
            FROM carga_combustible cc
            INNER JOIN bitacora b ON cc.bitacora_id = b.id
            WHERE cc.id = ? AND cc.isDeleted = 0
        `;

        const [rows] = await pool.query(query, [idNumber]);
        if (rows.length <= 0) {
            return res.status(404).json({ message: 'Carga de combustible no encontrada' });
        }

        const row = rows[0];
        res.json({
            id: row.id,
            'bitacora.id': row['bitacora.id'],
            'bitacora.direccion': row['bitacora.direccion'],
            'bitacora.fh_salida': row['bitacora.fh_salida'],
            'bitacora.fh_llegada': row['bitacora.fh_llegada'],
            'bitacora.km_salida': row['bitacora.km_salida'],
            'bitacora.km_llegada': row['bitacora.km_llegada'],
            'bitacora.hmetro_salida': row['bitacora.hmetro_salida'],
            'bitacora.hmetro_llegada': row['bitacora.hmetro_llegada'],
            'bitacora.hbomba_salida': row['bitacora.hbomba_salida'],
            'bitacora.hbomba_llegada': row['bitacora.hbomba_llegada'],
            'bitacora.obs': row['bitacora.obs'],
            litros: row.litros,
            valor_mon: row.valor_mon,
            img_url: row.img_url,
        });
    } catch (error) {
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};



// Crear una nueva carga de combustible
export const createCargaCombustible = async (req, res) => {
    const { bitacora_id, litros, valor_mon } = req.body;

    try {
        const bitacoraIdNumber = parseInt(bitacora_id);

        // Validar existencia de la bitácora
        const [bitacoraExists] = await pool.query("SELECT 1 FROM bitacora WHERE id = ? AND isDeleted = 0", [bitacoraIdNumber]);
        if (bitacoraExists.length === 0) {
            return res.status(400).json({ message: 'Bitácora no existe o está eliminada' });
        }

        if (isNaN(bitacoraIdNumber) || typeof litros !== 'number' || typeof valor_mon !== 'number') {
            return res.status(400).json({ message: 'Tipo de datos inválido' });
        }

        const [rows] = await pool.query(
            'INSERT INTO carga_combustible (bitacora_id, litros, valor_mon, isDeleted) VALUES (?, ?, ?, 0)',
            [bitacoraIdNumber, litros, valor_mon]
        );

        return res.status(201).json({
            id: rows.insertId,
            bitacora_id: bitacoraIdNumber,
            litros,
            valor_mon
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

export const createCargaCombustibleBitacora = async (req, res) => {
    const { bitacora, litros, valor_mon } = req.body;
    const errors = [];

    // Validar que los datos principales estén presentes
    if (!bitacora || typeof litros !== 'number' || typeof valor_mon !== 'number') {
        errors.push('Datos incompletos o inválidos');
        return res.status(400).json({ message: 'Datos incompletos o inválidos', errors });
    }

    // Extraer y validar los datos de la bitácora
    const {
        compania_id,
        personal_id,
        maquina_id,
        direccion,
        f_salida,
        h_salida,
        f_llegada,
        h_llegada,
        clave_id,
        km_salida,
        km_llegada,
        hmetro_salida,
        hmetro_llegada,
        hbomba_salida,
        hbomba_llegada,
        obs
    } = bitacora;

    try {
        // Concatenar fecha y hora para el formato datetime
        let fh_salida = null;
        let fh_llegada = null;

        if (f_salida && h_salida) {
            fh_salida = `${f_salida} ${h_salida}`;
        }
        if (f_llegada && h_llegada) {
            fh_llegada = `${f_llegada} ${h_llegada}`;
        }

        // Convertir los IDs a números y validar
        const companiaIdNumber = parseInt(compania_id);
        const personalIdNumber = parseInt(personal_id);
        const maquinaIdNumber = parseInt(maquina_id);
        const claveIdNumber = parseInt(clave_id);

        if (
            isNaN(companiaIdNumber) ||
            isNaN(personalIdNumber) ||
            isNaN(maquinaIdNumber) ||
            isNaN(claveIdNumber) ||
            typeof direccion !== 'string'
        ) {
            errors.push('Tipo de datos inválido en bitácora');
        }

        // manejar la carga de archivos si existen
        let img_url = null;

        // manejo de subida de imagen S3
        if (req.files) {
            const imagen = req.files.imagen ? req.files.imagen[0] : null;

            if (imagen) {
                try {
                    const imgData = await uploadFileToS3(imagen, "carga_combustible");
                    if (imgData && imgData.Location) {
                        img_url = imgData.Location;
                    }
                } catch (error) {
                    errors.push("Error al subir la imagen", error.message);
                }
            }
        }

        // TODO: usar "validateDate" para validar las fechas
        // Validación de fecha y hora si están presentes
        const fechaRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
        const horaRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

        if (f_salida && h_salida && (!fechaRegex.test(f_salida) || !horaRegex.test(h_salida))) {
            errors.push('El formato de la fecha o la hora de salida es inválido. Deben ser dd-mm-aaaa y HH:mm');
        }

        if (f_llegada && h_llegada && (!fechaRegex.test(f_llegada) || !horaRegex.test(h_llegada))) {
            errors.push('El formato de la fecha o la hora de llegada es inválido. Deben ser dd-mm-aaaa y HH:mm');
        }

        // Validar la existencia de las llaves foráneas
        const [companiaExists] = await pool.query(
            "SELECT 1 FROM compania WHERE id = ? AND isDeleted = 0",
            [companiaIdNumber]
        );
        if (companiaExists.length === 0) {
            errors.push("Compañía no existe o está eliminada");
        }

        const [personalExists] = await pool.query("SELECT 1 FROM personal WHERE id = ? AND isDeleted = 0", [personalIdNumber]
        );
        if (personalExists.length === 0) {
            errors.push("Personal no existe o está eliminado");
        }

        const [maquinaExists] = await pool.query(
            "SELECT 1 FROM maquina WHERE id = ? AND isDeleted = 0",
            [maquinaIdNumber]
        );
        if (maquinaExists.length === 0) {
            errors.push("Máquina no existe o está eliminada");
        }

        const [claveExists] = await pool.query(
            "SELECT 1 FROM clave WHERE id = ? AND isDeleted = 0",
            [claveIdNumber]
        );
        if (claveExists.length === 0) {
            errors.push("Clave no existe o está eliminada");
        }

        // validacion de numeros flotantes
        if(km_salida !== undefined){
            const error = validateFloat(km_salida);
            if(error){
                errors.push(`km_salida: ${error}`);
            } else {
                errors.push('km_salida es requerido');
            }
        }

        if(km_llegada !== undefined){
            const error = validateFloat(km_llegada);
            if(error){
                errors.push(`km_llegada: ${error}`);
            } else {
                errors.push('km_llegada es requerido');
            }
        }

        if(hmetro_salida !== undefined){
            const error = validateFloat(hmetro_salida);
            if(error){
                errors.push(`hmetro_salida: ${error}`);
            } else {
                errors.push('hmetro_salida es requerido');
            }
        }

        if(hmetro_llegada !== undefined){
            const error = validateFloat(hmetro_llegada);
            if(error){
                errors.push(`hmetro_llegada: ${error}`);
            } else {
                errors.push('hmetro_llegada es requerido');
            }
        }

        if(hbomba_salida !== undefined){
            const error = validateFloat(hbomba_salida);
            if(error){
                errors.push(`hbomba_salida: ${error}`);
            } else {
                errors.push('hbomba_salida es requerido');
            }
        }

        if(hbomba_llegada !== undefined){
            const error = validateFloat(hbomba_llegada);
            if(error){
                errors.push(`hbomba_llegada: ${error}`);
            } else {
                errors.push('hbomba_llegada es requerido');
            }
        }

        // Validación de litros y valor monetario
        if (litros <= 0) {
            errors.push("Ingrese valor válido para 'litros'");
        }

        if (valor_mon <= 0) {
            errors.push("Ingrese valor válido para 'valor_mon'");
        }

        // Si hay errores, no ejecutar las queries
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Crear una nueva bitácora
        const [bitacoraResult] = await pool.query(
            `INSERT INTO bitacora (
                compania_id, personal_id, maquina_id, direccion,
                fh_salida, fh_llegada, clave_id, km_salida, km_llegada,
                hmetro_salida, hmetro_llegada, hbomba_salida, hbomba_llegada, obs, isDeleted
            ) VALUES (?, ?, ?, ?, STR_TO_DATE(?, "%d-%m-%Y %H:%i"), STR_TO_DATE(?, "%d-%m-%Y %H:%i"), ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [
                companiaIdNumber, personalIdNumber, maquinaIdNumber, direccion,
                fh_salida, fh_llegada, claveIdNumber,
                km_salida, km_llegada, hmetro_salida, hmetro_llegada,
                hbomba_salida, hbomba_llegada, obs || null
            ]
        );

        const bitacoraId = bitacoraResult.insertId;

        // Crear la carga de combustible
        const [cargaResult] = await pool.query(
            'INSERT INTO carga_combustible (bitacora_id, litros, valor_mon, img_url, isDeleted) VALUES (?, ?, ?, ?, 0)',
            [bitacoraId, litros, valor_mon, img_url]
        );

        return res.status(201).json({
            id: cargaResult.insertId,
            bitacora_id: bitacoraId,
            litros,
            valor_mon,
            img_url
        });
    } catch (error) {
        errors.push(error.message);
        console.error(error);
        return res.status(500).json({ errors });
    }
};


// Dar de baja una carga de combustible
export const downCargaCombustible = async (req, res) => {
    const { id } = req.params;
    try {
        const idNumber = parseInt(id);
        if (isNaN(idNumber)) {
            return res.status(400).json({ message: "Tipo de datos inválido" });
        }

        const [result] = await pool.query("UPDATE carga_combustible SET isDeleted = 1 WHERE id = ?", [idNumber]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Carga de combustible no encontrada' });
        }
        
        res.status(204).end();
    } catch (error) {
        return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

// Actualizar una carga de combustible
export const updateCargaCombustible = async (req, res) => {
    const { id } = req.params;
    let { 
        bitacora_id, 
        litros, 
        valor_mon 
    } = req.body;

    const errors = []; // Arreglo para capturar errores
    const updates = {}; // Objeto para almacenar los campos a actualizar

    try {
        const idNumber = parseInt(id);
        const bitacoraIdNumber = parseInt(bitacora_id);

        // Validar existencia de la bitácora si se proporciona
        if (bitacora_id !== undefined) {
            const [bitacoraExists] = await pool.query("SELECT 1 FROM bitacora WHERE id = ? AND isDeleted = 0", [bitacoraIdNumber]);
            if (bitacoraExists.length === 0) {
                errors.push('Bitácora no existe o está eliminada');
            }
        }

        if (isNaN(bitacoraIdNumber) && bitacora_id !== undefined) {
            errors.push('Tipo de datos inválido para bitácora');
        }

        // Validar litros (float)
        if (litros !== undefined) {
            const error = validateFloat(litros);
            if (error) {
                errors.push(`litros: ${error}`);
            } else {
                updates.litros = litros; // Solo agregar si es válido
            }
        }

        // Validar valor_mon (int)
        if (valor_mon !== undefined && typeof valor_mon !== 'number') {
            errors.push('Tipo de datos inválido para valor_mon');
        } else if (valor_mon !== undefined) {
            updates.valor_mon = valor_mon; // Solo agregar si es válido
        }

        // Manejo de carga de archivos si existen
        let img_url = null;

        // Manejo de subida de imagen S3
        if (req.files) {
            const imagen = req.files.imagen ? req.files.imagen[0] : null;

            if (imagen) {
                try {
                    const imgData = await uploadFileToS3(imagen, "carga_combustible");
                    if (imgData && imgData.Location) {
                        img_url = imgData.Location;
                        updates.img_url = img_url;
                    }
                } catch (error) {
                    errors.push("Error al subir la imagen", error.message);
                }
            }
        }

        // Si hay errores, devolverlos
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Si bitacora_id se proporciona, agregarla al objeto de actualizaciones
        if (bitacora_id !== undefined) {
            updates.bitacora_id = bitacoraIdNumber;
        }

        // Construir la consulta de actualización
        const setClause = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(", ");

        if (!setClause) {
            return res.status(400).json({
                message: "No se proporcionaron campos para actualizar"
            });
        }

        const values = Object.values(updates).concat(idNumber);

        // Ejecutar la consulta
        const [result] = await pool.query(`UPDATE carga_combustible SET ${setClause} WHERE id = ?`, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Compañía no encontrada'
            });
        }

        // Recuperar los datos actualizados
        const [rows] = await pool.query('SELECT * FROM carga_combustible WHERE id = ?', [idNumber]);
        const row = rows[0];

        // Responder con los datos actualizados
        res.json({
            id: row.id,
            bitacora_id: row.bitacora_id,
            litros: row.litros,
            valor_mon: row.valor_mon,
            img_url: row.img_url,
        });
    } catch (error) {
        errors.push(error.message);
        return res.status(500).json({ message: 'Error interno del servidor', errors });
    }
};
