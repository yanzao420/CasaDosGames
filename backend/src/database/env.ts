export interface DatabaseConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
}

export function readDatabaseConfig(): DatabaseConfig {
  const database = process.env.DB_NAME?.trim() || 'casa_dos_games'
  if (!/^[A-Za-z0-9_]+$/.test(database)) {
    throw new Error('DB_NAME só pode conter letras, números e _.')
  }

  const port = Number(process.env.DB_PORT) || 3306

  return {
    host: process.env.DB_HOST?.trim() || 'localhost',
    port,
    user: process.env.DB_USER?.trim() || 'root',
    password: process.env.DB_PASSWORD ?? '',
    database,
  }
}
