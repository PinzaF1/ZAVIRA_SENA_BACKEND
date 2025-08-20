import type { HttpContext } from '@adonisjs/core/http'
import RegistroService from '../services/registroService.js'

const registroService = new RegistroService()

export default class RegistroController {
  
  // Registrar una nueva institucion
  public async registro({ request, response }: HttpContext) {
    try {
      // Obtener datos del request
      const {
        nombre_institucion,
        codigo_dane,
        direccion,
        telefono,
        jornada,
        correo,
        password
      } = request.only([
        'nombre_institucion',
        'codigo_dane',
        'direccion',
        'telefono',
        'jornada',
        'correo',
        'password'
      ])

      // Validar campos requeridos
      if (!codigo_dane || !telefono) {
        return response.badRequest({ error: 'Codigo DANE y telefono son requeridos' })
      }

      // Convertir a numeros
      const codigoDaneNum = parseInt(codigo_dane.toString(), 10)
      const telefonoNum = BigInt(telefono.toString())

      // Validar conversiones
      if (isNaN(codigoDaneNum)) {
        return response.badRequest({ error: 'Codigo DANE debe ser un numero valido' })
      }

      // Llamar al servicio para registrar la institucion
      const resultado = await registroService.registrarInstitucion(
        nombre_institucion,
        codigoDaneNum,
        direccion,
        telefonoNum,
        jornada,
        correo,
        password
      )

      return response.created(resultado)

    } catch (error) {
      return response.badRequest({ 
        error: 'Error al registrar institucion',
        detalles: error.message 
      })
    }
  }

  // Login para estudiantes
  async loginEstudiante({ request, response }: HttpContext) {
    try {
      // Obtener credenciales del request
      const { numero_documento, password } = request.only([
        'numero_documento',
        'password'
      ])

      // Validar campos requeridos
      if (!numero_documento || !password) {
        return response.badRequest({ error: 'Numero de documento y contraseña son requeridos' })
      }

      // Convertir a numero
      const documentoNum = parseInt(numero_documento.toString(), 10)
      if (isNaN(documentoNum)) {
        return response.badRequest({ error: 'Numero de documento debe ser valido' })
      }

      // Llamar al servicio para login
      const resultado = await registroService.loginEstudiante(documentoNum, password)
      
      // Manejar respuesta del servicio
      if (resultado.error) {
        return response.unauthorized({ error: resultado.error })
      }

      return response.ok(resultado)

    } catch (error) {
      return response.internalServerError({ 
        error: 'Error en el servidor durante el login' 
      })
    }
  }

  // Cambiar contraseña de estudiante
  public async cambiarPassword({ request, response }: HttpContext) {
    try {
      // Obtener datos del request
      const { numero_documento, nueva_password } = request.only([
        'numero_documento',
        'nueva_password'
      ])

      // Validar campos requeridos
      if (!numero_documento || !nueva_password) {
        return response.badRequest({ error: 'Numero de documento y nueva contraseña son requeridos' })
      }

      // Convertir a numero
      const documentoNum = parseInt(numero_documento.toString(), 10)
      if (isNaN(documentoNum)) {
        return response.badRequest({ error: 'Numero de documento debe ser valido' })
      }

      // Llamar al servicio para cambiar contraseña
      const resultado = await registroService.cambiarPassword(documentoNum, nueva_password)
      
      // Manejar respuesta del servicio
      if (resultado.error) {
        return response.notFound({ error: resultado.error })
      }

      return response.ok(resultado)

    } catch (error) {
      return response.internalServerError({ 
        error: 'Error al cambiar contraseña' 
      })
    }
  }
}
