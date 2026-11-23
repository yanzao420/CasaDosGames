import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import { readDatabaseConfig } from './env.ts'
import { seedIfEmpty } from './seed.ts'

function databaseCode(error: unknown): string {
  if (!error || typeof error !== 'object' || !('code' in error)) return ''
  return String(error.code)
}

function startupError(error: unknown): Error {
  const code = databaseCode(error)
  if (code === 'ECONNREFUSED') {
    return new Error(
      'Não foi possível conectar ao MySQL. Ligue o serviço (no Windows, MySQL80) e confira DB_HOST, DB_PORT, DB_USER e DB_PASSWORD no arquivo .env.',
    )
  }
  if (code === 'ER_ACCESS_DENIED_ERROR') {
    return new Error('O MySQL recusou o usuário ou a senha. Ajuste DB_USER e DB_PASSWORD no arquivo .env.')
  }
  if (error instanceof Error) return error
  return new Error('Falha ao preparar o banco.')
}

export async function prepareDatabase(): Promise<{ seeded: number }> {
  try {
    return await createSchemaAndSeed()
  } catch (error) {
    throw startupError(error)
  }
}

async function createSchemaAndSeed(): Promise<{ seeded: number }> {
  const config = readDatabaseConfig()
  const admin = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    multipleStatements: false,
  })

  try {
    await admin.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    )
    await admin.query(`USE \`${config.database}\``)

    const schemaPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'schema.sql')
    const raw = await readFile(schemaPath, 'utf8')
    const tableStart = raw.indexOf('CREATE TABLE')
    if (tableStart === -1) {
      throw new Error('schema.sql não contém CREATE TABLE.')
    }
    await admin.query(raw.slice(tableStart))
  } finally {
    await admin.end()
  }

  const seeded = await seedIfEmpty()
  return { seeded }
}
