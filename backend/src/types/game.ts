export interface Game {
  id: number
  title: string
  thumbnail: string
  short_description: string
  genre: string
  platform: string
  game_url: string
}

export interface GameInput {
  title: string
  thumbnail?: string
  short_description: string
  genre: string
  platform: string
  game_url?: string
}

export type GameSort = 'id' | 'title-asc' | 'title-desc' | 'genre'

export interface ListGamesQuery {
  page: number
  limit: number
  search: string
  genre: string
  sort: GameSort
}

export interface PaginatedGames {
  data: Game[]
  total: number
  page: number
  limit: number
  totalPages: number
}
