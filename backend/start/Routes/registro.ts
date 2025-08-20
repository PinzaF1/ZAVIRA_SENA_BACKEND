import Router from "@adonisjs/core/services/router"
import registroController from "../../app/controller/registroController.js"
import EstudiantesController from "../../app/controller/estudiantesController.js"
import Authjwt from "../../app/middleware/authjwt.js"

// Crear instancias
const registro = new registroController ()
const estudiante = new EstudiantesController ()
const authjwt = new Authjwt

// Ruta para registrar institución
Router.post('/registrarIns',registro.registro)/*.use(authjwt.handle.bind(authjwt))*/

// Ruta para subir CSV (CON autenticación JWT)
Router.post('/estudiantes/csv', estudiante.subirCSV).use(authjwt.handle.bind(authjwt))

// Ruta para registrar estudiante individual (CON autenticación)
Router.post('/registrar/estudiante', estudiante.registrarEstudiante)/*.use(authjwt.handle.bind(authjwt))*/

// Ruta para login de estudiantes (SIN autenticación) 
Router.post('/login/estudiante', registro.loginEstudiante)

// Ruta para cambiar password (SIN autenticación)
Router.post('/cambiar-password', registro.cambiarPassword)

// Ruta para listar estudiantes (CON autenticación JWT)
Router.get('/estudiantes/:id', estudiante.listarEstudiantes)/*.use(authjwt.handle.bind(authjwt))*/