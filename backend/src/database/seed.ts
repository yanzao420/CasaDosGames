import { insertManyIfEmpty } from '../repositories/games.repository.ts'
import type { GameInput } from '../types/game.ts'
import { cover } from '../utils/cover.ts'

const SEED_GAMES: GameInput[] = [
  {
    title: 'Eldoria Online',
    genre: 'MMORPG',
    platform: 'PC',
    short_description: 'Mundo persistente com clãs, masmorras e comércio entre jogadores.',
    game_url: 'https://example.com/jogos/eldoria-online',
  },
  {
    title: 'Neon Strike',
    genre: 'Shooter',
    platform: 'PC',
    short_description: 'Tiro tático em arenas neon, com rodadas curtas e ranking semanal.',
    game_url: 'https://example.com/jogos/neon-strike',
  },
  {
    title: 'Reino de Ferro',
    genre: 'Strategy',
    platform: 'PC',
    short_description: 'Construa fortalezas, gerencie recursos e dispute o mapa em turnos.',
    game_url: 'https://example.com/jogos/reino-de-ferro',
  },
  {
    title: 'Arena Luminosa',
    genre: 'MOBA',
    platform: 'PC',
    short_description: 'Partidas 5 contra 5 com rotas, objetivos e heróis desbloqueáveis.',
    game_url: 'https://example.com/jogos/arena-luminosa',
  },
  {
    title: 'Cartas do Abismo',
    genre: 'Card',
    platform: 'Web Browser',
    short_description: 'Duelos de cartas colecionáveis com partidas rápidas direto no navegador.',
    game_url: 'https://example.com/jogos/cartas-do-abismo',
  },
  {
    title: 'Zona Zero',
    genre: 'Battle Royale',
    platform: 'PC',
    short_description: 'Cem jogadores, zona encolhendo e loot espalhado pela cidade.',
    game_url: 'https://example.com/jogos/zona-zero',
  },
  {
    title: 'Copa das Ruas',
    genre: 'Sports',
    platform: 'PC',
    short_description: 'Futebol de rua com times personalizados e campeonatos locais.',
    game_url: 'https://example.com/jogos/copa-das-ruas',
  },
  {
    title: 'Circuito Íon',
    genre: 'Racing',
    platform: 'PC',
    short_description: 'Corridas antigravidade em pistas suspensas e voltas contra o tempo.',
    game_url: 'https://example.com/jogos/circuito-ion',
  },
  {
    title: 'Crônicas de Aether',
    genre: 'MMORPG',
    platform: 'Web Browser',
    short_description: 'Campanha cooperativa no navegador, com missões diárias e guildas.',
    game_url: 'https://example.com/jogos/cronicas-de-aether',
  },
  {
    title: 'Sniper Hollow',
    genre: 'Shooter',
    platform: 'PC',
    short_description: 'Missões de precisão em mapas abertos, sem hud poluído.',
    game_url: 'https://example.com/jogos/sniper-hollow',
  },
  {
    title: 'Império Silencioso',
    genre: 'Strategy',
    platform: 'PC',
    short_description: 'Expanda colônias, pesquise tecnologia e negocie com facções rivais.',
    game_url: 'https://example.com/jogos/imperio-silencioso',
  },
  {
    title: 'Duelo das Torres',
    genre: 'MOBA',
    platform: 'Web Browser',
    short_description: 'Defenda a torre central e escolha talentos a cada abate.',
    game_url: 'https://example.com/jogos/duelo-das-torres',
  },
]

export async function seedIfEmpty(): Promise<number> {
  const games = SEED_GAMES.map((game) => ({
    ...game,
    thumbnail: cover(game.title, game.genre),
  }))
  return insertManyIfEmpty(games)
}
