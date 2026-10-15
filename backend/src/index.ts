import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'
import { ip } from 'elysia-ip'

import { ResponseError } from './errors/ResponseError'
import { logger, requestLogger } from './lib/logger'
import { LessonRoutes } from './modules/lessons'
import { getRateLimitTtl } from './services/redis'

export const App = new Elysia()
	.use(ip({ headersOnly: true }))
	.use(requestLogger)
	.use(cors({ origin: process.env.CORS_ORIGIN ?? true }))
	.use(openapi())
	.error({ ResponseError })

	.onBeforeHandle(async ({ ip }) => {
		ip ||= '127.0.0.1'

		const retryAfter = await getRateLimitTtl(ip)
		if (retryAfter !== null) {
			logger.warn({ ip, retryAfter }, 'rate limit excedido')
			throw new ResponseError({
				statusCode: 429,
				error: 'você já gerou um pomodoro na última hora. tente novamente mais tarde.',
				retryAfter,
			}).toResponse()
		}
	})

	.use(LessonRoutes)

	.listen(
		{
			port: 3000,
			hostname: '0.0.0.0',
		},
		server => {
			logger.info({ hostname: server.hostname, port: server.port }, 'servidor iniciado')
		},
	)

export type App = typeof App
