import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Institucion from './institucione.js'
import Usuario from './usuario.js'
import SesionDetalle from './sesiones_detalle.js'

export default class BancoPregunta extends BaseModel {
  public static table = 'banco_preguntas'
  @column({ isPrimary: true })
  declare id_pregunta: number
  @column() declare id_institucion?: number
  @column() declare area: 'Matematicas'|'Lenguaje'|'Ciencias'|'Sociales'|'Ingles'
  @column() declare subtema: string
  @column() declare dificultad: 'facil'|'media'|'dificil'
  @column() declare estilo_kolb?: 'Divergente'|'Asimilador'|'Convergente'|'Acomodador'
  @column() declare pregunta: string
  @column() declare opciones: any
  @column() declare respuesta_correcta: string
  @column() declare explicacion?: string
  @column() declare time_limit_seconds?: number

  @column() declare origen: 'ai'|'manual'
  @column() declare review_status: 'borrador'|'aprobada'|'archivada'
  @column() declare created_by?: number
  @column() declare version: number
  @column() declare is_active: boolean

  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime
  @belongsTo(() => Institucion, { foreignKey: 'id_institucion' })
  declare institucion: BelongsTo<typeof Institucion>
  @belongsTo(() => Usuario, { foreignKey: 'created_by' })
  declare creador: BelongsTo<typeof Usuario>
  @hasMany(() => SesionDetalle, { foreignKey: 'id_pregunta' })
  declare usosEnSesiones: HasMany<typeof SesionDetalle>
}
