import { BaseSchema } from '@adonisjs/lucid/schema'
export default class extends BaseSchema {
  protected tableName = 'banco_preguntas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id_pregunta').primary()

      table.bigInteger('id_institucion').unsigned()
        .references('instituciones.id_institucion').onDelete('SET NULL').nullable()

      table.string('area', 30).notNullable()         // Matematicas | Lenguaje | Ciencias | Sociales | Ingles
      table.string('subtema', 120).notNullable()
      table.string('dificultad', 12).notNullable()   // facil | media | dificil
      table.string('estilo_kolb', 40)                // opcional

      table.text('pregunta').notNullable()
      table.jsonb('opciones').notNullable()          // [{key:'A',text:'...'},{...}]
      table.string('respuesta_correcta', 10).notNullable()
      table.text('explicacion')
      table.integer('time_limit_seconds')

      table.string('origen', 10).notNullable().defaultTo('ai')       // ai | manual
      table.string('review_status', 12).notNullable().defaultTo('aprobada') // borrador|aprobada|archivada

      table.bigInteger('created_by').unsigned()
        .references('usuarios.id_usuario').onDelete('SET NULL').nullable()

      table.integer('version').notNullable().defaultTo(1)
      table.boolean('is_active').notNullable().defaultTo(true)

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      table.unique(['id_institucion', 'area', 'subtema', 'pregunta', 'version'])
      table.index(['id_institucion', 'area', 'subtema', 'dificultad', 'estilo_kolb'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}