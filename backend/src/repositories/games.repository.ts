import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { pool } from '../database/connection.ts'
import type { Game, GameInput, GameSort } from '../types/game.ts'

interface GameRow extends RowDataPacket {
  id: number
  title: string
  thumbnail: string
  short_description: string
  genre: string
  platform: string
  game_url: string
}

interface CountRow extends RowDataPacket {
  total: number
}

const GAME_COLUMNS = 'id, title, thumbnail, short_description, genre, platform, game_url'

const INSERT_GAME_SQL = `
  INSERT INTO games (title, thumbnail, short_description, genre, platform, game_url)
  VALUES (?, ?, ?, ?, ?, ?)
`

const WHERE_FILTER = `
  WHERE (? = '' OR title LIKE ? ESCAPE '\\\\')
    AND (? = '' OR genre = ?)
`

const ORDER_BY: Record<GameSort, string> = {
  id: 'id ASC',
  'title-asc': 'title ASC, id ASC',
  'title-desc': 'title DESC, id ASC',
  genre: 'genre ASC, title ASC, id ASC',
}

export interface GameFilter {
  search: string
  genre: string
}

function mapGame(row: GameRow): Game {
  return {
    id: Number(row.id),
    title: row.title,
    thumbnail: row.thumbnail,
    short_description: row.short_description,
    genre: row.genre,
    platform: row.platform,
    game_url: row.game_url,
  }
}

function toLike(search: string): string {
  const escaped = search.replace(/[\\%_]/g, (match) => `\\${match}`)
  return `%${escaped}%`
}

function filterParams(filter: GameFilter): string[] {
  return [filter.search, toLike(filter.search), filter.genre, filter.genre]
}

function gameParams(input: GameInput): string[] {
  return [
    input.title,
    input.thumbnail ?? '',
    input.short_description,
    input.genre,
    input.platform,
    input.game_url ?? '',
  ]
}

export async function listAll(): Promise<Game[]> {
  const [rows] = await pool.query<GameRow[]>(
    `SELECT ${GAME_COLUMNS} FROM games ORDER BY id ASC`,
  )
  return rows.map(mapGame)
}

export async function findById(id: number): Promise<Game | null> {
  const [rows] = await pool.query<GameRow[]>(
    `SELECT ${GAME_COLUMNS} FROM games WHERE id = ?`,
    [id],
  )
  const row = rows[0]
  return row ? mapGame(row) : null
}

export async function insert(input: GameInput): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(INSERT_GAME_SQL, gameParams(input))
  return result.insertId
}

export async function update(id: number, input: GameInput): Promise<void> {
  await pool.query(
    `UPDATE games
     SET title = ?, thumbnail = ?, short_description = ?, genre = ?, platform = ?, game_url = ?
     WHERE id = ?`,
    [...gameParams(input), id],
  )
}

export async function remove(id: number): Promise<void> {
  await pool.query('DELETE FROM games WHERE id = ?', [id])
}

export async function countFiltered(filter: GameFilter): Promise<number> {
  const [rows] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) AS total FROM games ${WHERE_FILTER}`,
    filterParams(filter),
  )
  return Number(rows[0]?.total ?? 0)
}

export async function findFiltered(
  filter: GameFilter & { sort: GameSort; limit: number; offset: number },
): Promise<Game[]> {
  const orderBy = ORDER_BY[filter.sort] ?? ORDER_BY.id
  const [rows] = await pool.query<GameRow[]>(
    `SELECT ${GAME_COLUMNS}
     FROM games
     ${WHERE_FILTER}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...filterParams(filter), filter.limit, filter.offset],
  )
  return rows.map(mapGame)
}

export async function insertManyIfEmpty(games: GameInput[]): Promise<number> {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const [rows] = await connection.query<CountRow[]>('SELECT COUNT(*) AS total FROM games')
    if (Number(rows[0]?.total ?? 0) > 0) {
      await connection.commit()
      return 0
    }

    for (const game of games) {
      await connection.query<ResultSetHeader>(INSERT_GAME_SQL, gameParams(game))
    }

    await connection.commit()
    return games.length
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
