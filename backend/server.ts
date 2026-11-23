import 'dotenv/config'
import cors from '@fastify/cors'
import Fastify from 'fastify'
import { prepareDatabase } from './src/database/prepare.ts'
import { registerErrorHandler } from './src/plugins/error-handler.ts'
import { gameRoutes } from './src/routes/games.routes.ts'
import { healthRoutes } from './src/routes/health.routes.ts'

const app = Fastify({
  logger: true,
  ajv: {
    customOptions: {
      coerceTypes: 'array',
      useDefaults: true,
      removeAdditional: false,
      allErrors: false,
    },
  },
})
const port = Number(process.env.PORT) || 3333

registerErrorHandler(app)

await app.register(cors, {
  origin(origin, callback) {
    const allowed = !origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
    callback(null, allowed)
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
})

await app.register(healthRoutes)
await app.register(gameRoutes)

try {
  const { seeded } = await prepareDatabase()
  if (seeded > 0) {
    app.log.info(`Catálogo inicial criado com ${seeded} jogos.`)
  }
  await app.listen({ port, host: '0.0.0.0' })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
