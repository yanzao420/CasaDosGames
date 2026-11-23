import type { FastifyPluginAsync } from 'fastify'
import {
  create,
  list,
  listPaginated,
  remove,
  show,
  update,
} from '../controllers/games.controller.ts'
import {
  createGameSchema,
  gameIdSchema,
  listGamesQuerySchema,
  updateGameSchema,
} from '../schemas/games.schema.ts'

export const gameRoutes: FastifyPluginAsync = async (app) => {
  app.get('/games', list)
  app.get('/games/paginated', { schema: listGamesQuerySchema }, listPaginated)
  app.get('/games/:id', { schema: gameIdSchema }, show)
  app.post('/games', { schema: createGameSchema }, create)
  app.put('/games/:id', { schema: updateGameSchema }, update)
  app.delete('/games/:id', { schema: gameIdSchema }, remove)
}
