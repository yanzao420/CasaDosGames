import { useEffect, useState } from 'react'
import { CATALOG_PAGE_SIZE } from '../constants/catalog'
import { fetchPaginatedGames } from '../services/api'
import type { Game } from '../types/game'
import type { SortOption } from '../utils/gamesList'

interface UsePaginatedGamesArgs {
  page: number
  search: string
  genre: string
  sort: SortOption
}

export function usePaginatedGames({ page, search, genre, sort }: UsePaginatedGamesArgs) {
  const [games, setGames] = useState<Game[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const requestKey = `${page}\n${search}\n${genre}\n${sort}\n${reloadKey}`
  const [trackedKey, setTrackedKey] = useState(requestKey)

  if (trackedKey !== requestKey) {
    setTrackedKey(requestKey)
    setLoading(true)
    setError('')
  }

  useEffect(() => {
    let active = true

    fetchPaginatedGames({
      page,
      limit: CATALOG_PAGE_SIZE,
      search,
      genre,
      sort,
    })
      .then((result) => {
        if (!active) return
        setGames(result.data)
        setTotal(result.total)
        setTotalPages(result.totalPages)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (!active) return
        setGames([])
        setTotal(0)
        setTotalPages(0)
        setError(err instanceof Error ? err.message : 'Não foi possível carregar o catálogo.')
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [page, search, genre, sort, reloadKey])

  function retry() {
    setReloadKey((current) => current + 1)
  }

  return {
    games,
    total,
    page,
    limit: CATALOG_PAGE_SIZE,
    totalPages,
    loading,
    error,
    retry,
  }
}
