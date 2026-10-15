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
	.use(
		openapi({
			documentation: {
				info: {
					title: 'pomoshot API',
					version: '1.0.0',
					description:
						'Recebe capturas de tela de aulas, usa o Gemini para identificar o assunto, os tópicos e o tempo de estudo, e devolve os dados para montar o plano pomodoro. Cada IP pode gerar um plano por hora.',
				},
				tags: [{ name: 'lessons', description: 'Extração de aulas a partir de imagens' }],
			},
		}),
	)
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
