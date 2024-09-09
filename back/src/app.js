import express from "express";
import morgan from "morgan";
// TODO: import desde routes
import indexRoutes from './routes/index.routes.js';

import rol_personalRoutes from './routes/rol_personal.routes.js';
import companiaRoutes from './routes/compania.routes.js';
import personalRoutes from './routes/personal.routes.js';
import claveRoutes from './routes/clave.routes.js';
import tipo_maquinaRoutes from './routes/tipo_maquina.routes.js';
import procedenciaRoutes from './routes/procedencia.routes.js';
import maquinaRoutes from './routes/maquina.routes.js';
import tallerRoutes from './routes/taller.routes.js';
import conductor_maquinaRoutes from './routes/conductor_maquina.routes.js';
import bitacoraRoutes from './routes/bitacora.routes.js';
import mantencionRoutes from './routes/mantencion.routes.js';
import tipoMantencionRoutes from './routes/tipo_mantencion.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';

const app = express();
app.use(express.json());
app.use(morgan('dev'));

const base_route = "/api/";

// TODO:  rutas de la api
app.use(indexRoutes);
app.use(base_route, rol_personalRoutes); 
app.use(base_route, companiaRoutes); 
app.use(base_route, personalRoutes);
app.use(base_route, claveRoutes); // revisar
app.use(base_route, tipo_maquinaRoutes); // revisar
app.use(base_route, procedenciaRoutes); // revisar
app.use(base_route, maquinaRoutes); // revisar
app.use(base_route, tallerRoutes); // revisar
app.use(base_route, conductor_maquinaRoutes); // revisar
app.use(base_route, bitacoraRoutes); // revisar
app.use(base_route, mantencionRoutes); // revisar
app.use(base_route, tipoMantencionRoutes); // revisar
app.use(base_route, usuarioRoutes); // revisar

// endpoint
app.use((req, res) =>{
    res.status(404).json({
        message: 'endpoint not found'
    })
})

export default app;