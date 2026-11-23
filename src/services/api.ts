import { API_URL } from '../constants/catalog'
import type { Game, GameInput, GamesPageQuery, PaginatedGames } from '../types/game'

interface ApiErrorBody {
  message?: string
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response

  const headers: HeadersInit = {
    ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
    ...options?.headers,
  }

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new Error('Não foi possível conectar à API. Confira se o Fastify está rodando na porta 3333.')
  }

  if (response.status === 204) {
    return undefined as T
  }

  const data = (await response.json().catch(() => ({}))) as T & ApiErrorBody

  if (!response.ok) {
    throw new Error(data.message || 'A API recusou a operação.')
  }

  return data
}

export function fetchGames(): Promise<Game[]> {
  return request<Game[]>('/games')
}

export function fetchPaginatedGames(query: GamesPageQuery = {}): Promise<PaginatedGames> {
  const params = new URLSearchParams()
  params.set('page', String(query.page ?? 1))
  params.set('limit', String(query.limit ?? 10))
  params.set('search', query.search ?? '')
  params.set('sort', query.sort ?? 'title-asc')
  if (query.genre) params.set('genre', query.genre)

  return request<PaginatedGames>(`/games/paginated?${params.toString()}`)
}

export function fetchGame(id: number): Promise<Game> {
  return request<Game>(`/games/${id}`)
}

export function createGame(input: GameInput): Promise<Game> {
  return request<Game>('/games', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateGame(id: number, input: GameInput): Promise<Game> {
  return request<Game>(`/games/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteGame(id: number): Promise<void> {
  return request<void>(`/games/${id}`, { method: 'DELETE' })
}
