import 'dotenv/config'
import { pool } from './connection.ts'
import { prepareDatabase } from './prepare.ts'

try {
  const { seeded } = await prepareDatabase()
  if (seeded > 0) {
    console.log(`Banco pronto. ${seeded} jogos inseridos na tabela games.`)
  } else {
    console.log('Banco pronto. A tabela games já tinha registros e não foi semeada de novo.')
  }
} catch (error) {
  console.error('Falha ao preparar o MySQL. Confira se o serviço está ligado e se o .env está correto.')
  console.error(error)
  process.exitCode = 1
} finally {
  await pool.end()
}
