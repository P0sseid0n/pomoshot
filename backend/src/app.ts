import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'
import { ip } from 'elysia-ip'

import { ResponseError } from './errors/ResponseError'
import { requestLogger } from './lib/logger'
import { LessonRoutes } from './modules/lessons'
import { PlanRoutes } from './modules/plans'

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
						'Recebe capturas de tela de aulas, usa o Gemini para identificar o assunto, os tópicos e o tempo de estudo, e devolve os dados para montar o plano pomodoro. Cada IP pode gerar um plano por hora. Os planos podem ser compartilhados por um link que dura 7 dias.',
				},
				tags: [
					{ name: 'lessons', description: 'Extração de aulas a partir de imagens' },
					{ name: 'plans', description: 'Links para compartilhar um plano de estudo' },
				],
			},
		}),
	)
	.error({ ResponseError })

	.use(LessonRoutes)
	.use(PlanRoutes)
