import styles from './Pagination.module.css'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <nav className={styles.bar} aria-label="Paginação do catálogo">
      <button
        type="button"
        className={styles.button}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Anterior
      </button>
      <p className={styles.status}>Página {page} de {totalPages}</p>
      <button
        type="button"
        className={styles.button}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Próxima
      </button>
    </nav>
  )
}
