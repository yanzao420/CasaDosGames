import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  createGame,
  deleteGame,
  getGame,
  listGames,
  listPaginatedGames,
  updateGame,
} from '../services/games.service.ts'
import type { GameInput, ListGamesQuery } from '../types/game.ts'

interface IdParams {
  id: number
}

export async function list() {
  return listGames()
}

export async function listPaginated(request: FastifyRequest<{ Querystring: ListGamesQuery }>) {
  return listPaginatedGames(request.query)
}

export async function show(request: FastifyRequest<{ Params: IdParams }>) {
  return getGame(request.params.id)
}

export async function create(request: FastifyRequest<{ Body: GameInput }>, reply: FastifyReply) {
  const game = await createGame(request.body)
  return reply.status(201).send(game)
}

export async function update(request: FastifyRequest<{ Params: IdParams; Body: GameInput }>) {
  return updateGame(request.params.id, request.body)
}

export async function remove(request: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
  await deleteGame(request.params.id)
  return reply.status(204).send()
}
