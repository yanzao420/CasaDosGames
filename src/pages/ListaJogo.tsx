import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Feedback from '../components/Feedback/Feedback'
import GameCard from '../components/GameCard/GameCard'
import Pagination from '../components/Pagination/Pagination'
import { GENRES } from '../constants/catalog'
import { usePaginatedGames } from '../hooks/usePaginatedGames'
import { measureFilterCost, type FilterBenchmark, type SortOption } from '../utils/gamesList'
import styles from './ListaJogo.module.css'

export default function ListaJogo() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [sort, setSort] = useState<SortOption>('title-asc')
  const [page, setPage] = useState(1)
  const [benchmark, setBenchmark] = useState<FilterBenchmark | undefined>()
  const searchTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(searchTimer.current), [])

  const { games, total, totalPages, loading, error, retry } = usePaginatedGames({
    page,
    search,
    genre: selectedGenre,
    sort,
  })

  function handleSearch(value: string) {
    setSearchInput(value)
    window.clearTimeout(searchTimer.current)
    searchTimer.current = window.setTimeout(() => {
      setSearch(value.trim())
      setPage(1)
    }, 300)
  }

  function handleGenre(value: string) {
    setSelectedGenre(value)
    setPage(1)
  }

  function handleSort(value: SortOption) {
    setSort(value)
    setPage(1)
  }

  function runBenchmark() {
    const result = measureFilterCost(games)
    if (result) setBenchmark(result)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Catálogo de Jogos</h1>
          <Link to="/jogos/novo" className={styles.createLink}>Cadastrar jogo</Link>
        </div>
      </header>

      <div className={styles.filtersContainer}>
        <input
          type="text"
          placeholder="Pesquisar por nome..."
          value={searchInput}
          maxLength={100}
          onChange={(event) => handleSearch(event.target.value)}
          className={styles.searchInput}
        />

        <select
          value={selectedGenre}
          onChange={(event) => handleGenre(event.target.value)}
          className={styles.selectInput}
        >
          <option value="">Todos os gêneros</option>
          {GENRES.map((genre) => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(event) => handleSort(event.target.value as SortOption)}
          className={styles.selectInput}
        >
          <option value="title-asc">Nome (A-Z)</option>
          <option value="title-desc">Nome (Z-A)</option>
          <option value="genre">Gênero</option>
        </select>
      </div>

      {loading && <Feedback tone="loading" message="Carregando catálogo..." />}
      {!loading && error && <Feedback tone="error" message={error} onRetry={retry} />}
      {!loading && !error && games.length === 0 && (
        <Feedback tone="empty" message="Nenhum jogo encontrado para essa busca ou filtro." />
      )}

      {!loading && !error && games.length > 0 && (
        <>
          <p className={styles.resultCount}>{total} jogo(s) encontrado(s)</p>
          <div className={styles.benchmark}>
            <button type="button" onClick={runBenchmark} className={styles.benchmarkButton}>
              Medir filtro
            </button>
            {benchmark && (
              <p>
                {benchmark.rounds} filtros em {benchmark.items} jogos: sem reutilizar o resultado {benchmark.beforeMs} ms,
                reutilizando {benchmark.afterMs} ms.
              </p>
            )}
          </div>
          <div className={styles.grid}>
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </>
      )}

      {!loading && !error && totalPages > 0 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  )
}
