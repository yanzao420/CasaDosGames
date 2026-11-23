import mysql from 'mysql2/promise'
import { readDatabaseConfig } from './env.ts'

const config = readDatabaseConfig()

export const pool = mysql.createPool({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4_unicode_ci',
})
