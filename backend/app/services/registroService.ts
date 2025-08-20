import Institucion from '../models/institucion.js'
import Usuario from '../models/usuario.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const SECRET = process.env.jwt_secret || 'secret123'

export default class RegistroService {
  
  // Registrar una nueva institucion
  async registrarInstitucion(
    nombre_institucion: string,
    codigo_dane: number,
    direccion: string,
    telefono: bigint,
    jornada: string,
    correo: string,
    password: string
  ) {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear la institucion en la base de datos
    const institucion = await Institucion.create({
      nombre_institucion,
      codigo_dane,
      direccion,
      telefono,
      jornada,
      correo,
      password: hashedPassword,
    })

    // Generar token JWT para la institucion
    const token = jwt.sign(
      { 
        id: institucion.id_institucion, 
        correo: institucion.correo,
        rol: 'Administrador' 
      },
      SECRET,
      { expiresIn: '1d' }
    )

    return {
      mensaje: 'Institucion registrada correctamente',
      institucion: institucion,
      token: token
    }
  }

  // Login para estudiantes
  async loginEstudiante(numero_documento: number, password: string) {
    // Buscar estudiante por numero de documento
    const estudiante = await Usuario.query()
      .where('numero_documento', numero_documento)
      .where('rol', 'Usuario')
      .first()

    if (!estudiante) {
      return { error: 'Numero de documento no registrado en el sistema' }
    }

    // Verificar si la contraseña es correcta
    const passwordValida = await bcrypt.compare(password, estudiante.password)
    if (!passwordValida) {
      return { error: 'Contraseña incorrecta' }
    }

    // Generar token JWT para el estudiante
    const token = jwt.sign(
      { 
        id: estudiante.id_usuario, 
        documento: estudiante.numero_documento,
        rol: estudiante.rol 
      },
      SECRET,
      { expiresIn: '24h' }
    )

    return {
      success: true,
      mensaje: 'Login exitoso',
      estudiante: {
        id: estudiante.id_usuario,
        nombre: estudiante.nombre_usuario,
        apellido: estudiante.apellido,
        documento: estudiante.numero_documento,
        grado: estudiante.grado,
        curso: estudiante.curso,
        institucion: estudiante.id_institucion
      },
      token: token
    }
  }

  // Cambiar contraseña de estudiante
  async cambiarPassword(documento: number, nuevaPassword: string) {
    // Buscar estudiante por numero de documento
    const estudiante = await Usuario.query()
      .where('numero_documento', documento)
      .where('rol', 'Usuario')
      .first()

    if (!estudiante) {
      return { error: 'Estudiante no encontrado' }
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10)
    estudiante.password = hashedPassword
    await estudiante.save()

    return { 
      success: true, 
      mensaje: 'Contraseña actualizada correctamente' 
    }
  }
}