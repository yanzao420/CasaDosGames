import type { FastifyError, FastifyInstance } from 'fastify'
import { AppError } from '../errors/app-error.ts'

const FIELD_MESSAGES: Record<string, string> = {
  title: 'Informe um título com pelo menos 2 caracteres.',
  short_description: 'Informe uma descrição com pelo menos 10 caracteres.',
  genre: 'Informe o gênero.',
  platform: 'Informe a plataforma.',
  thumbnail: 'A imagem precisa ser uma URL que comece com http:// ou https://.',
  game_url: 'O link do jogo precisa ser uma URL que comece com http:// ou https://.',
  page: 'A página precisa ser um número inteiro a partir de 1.',
  limit: 'O limite precisa ser um número inteiro entre 1 e 50.',
  search: 'A busca pode ter no máximo 100 caracteres.',
  sort: 'Ordenação inválida.',
  id: 'Identificador inválido.',
}

function validationField(issue: { instancePath?: string; params?: unknown }): string {
  const fromPath = (issue.instancePath ?? '').split('/').filter(Boolean).at(-1)
  if (fromPath) return fromPath

  if (issue.params && typeof issue.params === 'object' && 'missingProperty' in issue.params) {
    const missing = (issue.params as { missingProperty?: unknown }).missingProperty
    if (typeof missing === 'string') return missing
  }

  return ''
}

export function validationMessage(error: FastifyError): string {
  const issue = error.validation?.[0]
  if (!issue) return 'Dados inválidos.'
  if (issue.keyword === 'additionalProperties') return 'Há campos que esta rota não aceita.'

  const field = validationField(issue)
  if (!field && issue.keyword === 'type') return 'Envie um JSON com os dados do jogo.'
  return FIELD_MESSAGES[field] ?? 'Dados inválidos.'
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ message: error.message })
    }

    if (error.validation) {
      return reply.status(400).send({ message: validationMessage(error) })
    }

    request.log.error(error)
    const statusCode = error.statusCode && error.statusCode >= 400 ? error.statusCode : 500
    if (statusCode >= 500) {
      return reply.status(500).send({ message: 'Erro interno ao processar a requisição.' })
    }

    return reply.status(statusCode).send({ message: error.message || 'Não foi possível concluir a operação.' })
  })
}
