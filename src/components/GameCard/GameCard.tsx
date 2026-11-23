import { Link } from 'react-router-dom'
import type { Game } from '../../types/game'
import styles from './GameCard.module.css'

interface GameCardProps {
  game: Game
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <article className={styles.card}>
      <img src={game.thumbnail} alt={game.title} />
      <div className={styles.cardContent}>
        <span className={styles.genreBadge}>{game.genre}</span>
        <h3>{game.title}</h3>
        <p>{game.short_description}</p>
      </div>
      <div className={styles.cardFooter}>
        <Link to={`/jogos/${game.id}`} className={styles.detailsButton}>
          Ver detalhes
        </Link>
      </div>
    </article>
  )
}
