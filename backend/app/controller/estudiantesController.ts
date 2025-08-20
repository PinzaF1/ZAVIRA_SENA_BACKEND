import type { HttpContext } from '@adonisjs/core/http'
import Usuario from '../models/usuario.js'
import bcrypt from 'bcrypt'
import fs from 'fs'

export default class EstudiantesController {
  
    // Método para subir CSV con estudiantes
    public async subirCSV({ request, response }: HttpContext) {
        try {
            // 1. Obtener el archivo CSV de la solicitud
            const archivoCSV = request.file('csv_estudiantes')
            if (!archivoCSV) {
                return response.badRequest({ error: 'No se envió ningún archivo CSV' })
            }

            // 2. Verificar que tmpPath existe
            if (!archivoCSV.tmpPath) {
                return response.badRequest({ error: 'Error con el archivo subido' })
            }

            // 3. Obtener el ID de la institución
            const { id_institucion } = request.only(['id_institucion'])
            if (!id_institucion) {
                return response.badRequest({ error: 'El ID de la institución es requerido' })
            }

            // 4. Leer el contenido del archivo CSV (usando tmpPath que sabemos que existe)
            const contenidoCSV = fs.readFileSync(archivoCSV.tmpPath, 'utf-8')
            const lineas = contenidoCSV.split('\n').filter(linea => linea.trim() !== '')
            
            // Arrays para guardar resultados
            const estudiantesCreados = []
            const estudiantesConError = []

            // 5. Procesar cada línea del CSV (empezar desde la línea 1 para saltar el encabezado)
            for (let i = 1; i < lineas.length; i++) {
                const linea = lineas[i].trim()
                
                try {
                    // Dividir la línea por comas
                    const campos = linea.split(',')
                    
                    // Verificar que tenga todos los campos necesarios
                    if (campos.length < 7) {
                        throw new Error('La línea no tiene todos los campos requeridos')
                    }

                    // Crear objeto estudiante desde los campos del CSV
                    const estudianteCSV = {
                        nombre: campos[0].trim(),
                        apellido: campos[1].trim(),
                        tipo_documento: campos[2].trim(),
                        numero_documento: campos[3].trim(),
                        grado: campos[4].trim(),
                        curso: campos[5].trim(),
                        jornada: campos[6].trim(),
                        correo: campos[7] ? campos[7].trim() : ''
                    }

                    // 6. Generar contraseña automática (documento + últimas 3 letras del apellido)
                    const passwordPlana = estudianteCSV.numero_documento + estudianteCSV.apellido.slice(-3)
                    const passwordEncriptada = await bcrypt.hash(passwordPlana.toLowerCase(), 10)

                    // 7. Crear el estudiante en la base de datos
                    const estudianteDB = await Usuario.create({
                        nombre_usuario: estudianteCSV.nombre,
                        apellido: estudianteCSV.apellido,
                        tipo_documento: estudianteCSV.tipo_documento,
                        numero_documento: BigInt(estudianteCSV.numero_documento),
                        grado: Number(estudianteCSV.grado),
                        curso: estudianteCSV.curso,
                        jornada: estudianteCSV.jornada,
                        correo: estudianteCSV.correo,
                        password: passwordEncriptada,
                        rol: 'Usuario',
                        id_institucion: Number(id_institucion)
                    })

                    estudiantesCreados.push(estudianteDB)

                } catch (error) {
                    estudiantesConError.push({
                        linea: linea,
                        error: error.message
                    })
                }
            }

            // 8. Responder con el resultado del proceso
            return response.ok({
                mensaje: 'Procesamiento del CSV completado',
                total_estudiantes: lineas.length - 1, // Restar 1 por el encabezado
                estudiantes_creados: estudiantesCreados.length,
                estudiantes_con_error: estudiantesConError.length,
                errores: estudiantesConError
            })

        } catch (error) {
            return response.badRequest({ 
                error: 'Error al procesar el archivo CSV',
                detalle: error.message 
            })
        }
    }

    public async registrarEstudiante({ request, response }: HttpContext) {
    try {
        // Obtener datos del request
        const {
            nombre_usuario,
            apellido,
            tipo_documento,
            numero_documento,
            grado,
            curso,
            jornada,
            correo,
            id_institucion
        } = request.only([
            'nombre_usuario',
            'apellido',
            'tipo_documento',
            'numero_documento',
            'grado',
            'curso',
            'jornada',
            'correo',
            'id_institucion'
        ])

        // Generar password automática (documento + últimas 3 letras del apellido)
        const passwordPlana = numero_documento + apellido.slice(-3)
        const passwordEncriptada = await bcrypt.hash(passwordPlana.toLowerCase(), 10)

        // Crear el estudiante en la base de datos
        const estudiante = await Usuario.create({
            nombre_usuario,
            apellido,
            tipo_documento,
            numero_documento:(numero_documento),
            grado: Number(grado),
            curso,
            jornada,
            correo: correo || '',
            password: passwordEncriptada,
            rol: 'Usuario',
            id_institucion: Number(id_institucion)
        })

        return response.created({
            mensaje: 'Estudiante registrado correctamente',
            estudiante: {
                id: estudiante.id_usuario,
                nombre: estudiante.nombre_usuario,
                apellido: estudiante.apellido,
                documento: estudiante.numero_documento,
                grado: estudiante.grado,
                curso: estudiante.curso
            },
            password_temporal: passwordPlana.toLowerCase()
        })

    } catch (error) {
        return response.badRequest({ 
            error: 'Error al registrar estudiante',
            detalle: error.message 
        })
    }
}

  // Método para listar estudiantes de una institución
// Método para listar estudiantes de una institución
public async listarEstudiantes({ response, params }: HttpContext) {
    try {
        // Obtener ID de la institución desde los parámetros de la URL
        const id_institucion = params.id  // ← Cambiado a params.id
        
        // Buscar estudiantes
        const estudiantes = await Usuario.query()
            .where('id_institucion', id_institucion)
            .where('rol', 'Usuario')
            .select('*')

        // Devolver lista
        return response.ok(estudiantes)

    } catch (error) {
        return response.badRequest({ 
            error: 'Error al listar estudiantes' 
        })
    }
 }
}