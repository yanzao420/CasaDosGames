const gameBody = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'short_description', 'genre', 'platform'],
  properties: {
    title: { type: 'string', minLength: 2, maxLength: 120 },
    short_description: { type: 'string', minLength: 10, maxLength: 500 },
    genre: { type: 'string', minLength: 1, maxLength: 40 },
    platform: { type: 'string', minLength: 1, maxLength: 40 },
    thumbnail: { type: 'string', maxLength: 2048, pattern: '^$|^https?://\\S+$' },
    game_url: { type: 'string', maxLength: 500, pattern: '^$|^https?://\\S+$' },
  },
} as const

const idParams = {
  type: 'object',
  additionalProperties: false,
  required: ['id'],
  properties: {
    id: { type: 'integer', minimum: 1 },
  },
} as const

export const listGamesQuerySchema = {
  querystring: {
    type: 'object',
    additionalProperties: false,
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
      search: { type: 'string', maxLength: 100, default: '' },
      genre: { type: 'string', maxLength: 40, default: '' },
      sort: {
        type: 'string',
        enum: ['id', 'title-asc', 'title-desc', 'genre'],
        default: 'id',
      },
    },
  },
} as const

export const createGameSchema = {
  body: gameBody,
} as const

export const gameIdSchema = {
  params: idParams,
} as const

export const updateGameSchema = {
  params: idParams,
  body: gameBody,
} as const
