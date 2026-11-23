import { AppError } from '../errors/app-error.ts'
import * as gamesRepository from '../repositories/games.repository.ts'
import type { Game, GameInput, ListGamesQuery, PaginatedGames } from '../types/game.ts'
import { cover } from '../utils/cover.ts'

function isHttpUrl(value: string): boolean {
  return value.startsWith('https://') || value.startsWith('http://')
}

export function normalizeGameInput(input: GameInput): Required<GameInput> {
  const title = input.title.trim()
  const shortDescription = input.short_description.trim()
  const genre = input.genre.trim()
  const platform = input.platform.trim()
  const thumbnail = input.thumbnail?.trim() ?? ''
  const gameUrl = input.game_url?.trim() ?? ''

  if (title.length < 2) {
    throw new AppError('Informe um título com pelo menos 2 caracteres.', 400)
  }
  if (shortDescription.length < 10) {
    throw new AppError('Informe uma descrição com pelo menos 10 caracteres.', 400)
  }
  if (!genre) {
    throw new AppError('Informe o gênero.', 400)
  }
  if (!platform) {
    throw new AppError('Informe a plataforma.', 400)
  }
  if (thumbnail && !isHttpUrl(thumbnail)) {
    throw new AppError('A imagem precisa ser uma URL que comece com http:// ou https://.', 400)
  }
  if (gameUrl && !isHttpUrl(gameUrl)) {
    throw new AppError('O link do jogo precisa ser uma URL que comece com http:// ou https://.', 400)
  }

  return {
    title,
    short_description: shortDescription,
    genre,
    platform,
    thumbnail: thumbnail || cover(title, genre),
    game_url: gameUrl,
  }
}

export async function listGames(): Promise<Game[]> {
  return gamesRepository.listAll()
}

export async function listPaginatedGames(query: ListGamesQuery): Promise<PaginatedGames> {
  const page = query.page
  const limit = query.limit
  const offset = (page - 1) * limit
  const filter = {
    search: query.search.trim(),
    genre: query.genre.trim(),
    sort: query.sort,
    limit,
    offset,
  }

  const total = await gamesRepository.countFiltered(filter)
  const data = await gamesRepository.findFiltered(filter)
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit)

  return { data, total, page, limit, totalPages }
}

export async function getGame(id: number): Promise<Game> {
  const game = await gamesRepository.findById(id)
  if (!game) throw new AppError('Jogo não encontrado.', 404)
  return game
}

export async function createGame(input: GameInput): Promise<Game> {
  const normalized = normalizeGameInput(input)
  const id = await gamesRepository.insert(normalized)
  const game = await gamesRepository.findById(id)
  if (!game) throw new AppError('Não foi possível confirmar o jogo cadastrado.', 500)
  return game
}

export async function updateGame(id: number, input: GameInput): Promise<Game> {
  const current = await gamesRepository.findById(id)
  if (!current) throw new AppError('Jogo não encontrado.', 404)

  const normalized = normalizeGameInput(input)
  await gamesRepository.update(id, normalized)
  return { id, ...normalized }
}

export async function deleteGame(id: number): Promise<void> {
  const current = await gamesRepository.findById(id)
  if (!current) throw new AppError('Jogo não encontrado.', 404)
  await gamesRepository.remove(id)
}
