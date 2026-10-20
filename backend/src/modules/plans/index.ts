import { Elysia } from 'elysia'
import { ip as ipPlugin } from 'elysia-ip'

import { ResponseError, ResponseErrorBody } from '../../errors/ResponseError'
import { logger } from '../../lib/logger'
import {
	consumePlanShareQuota,
	createSharedPlan,
	getSharedPlan,
	isSharingAvailable,
	MAX_PLAN_SHARES_PER_HOUR,
	PLAN_TTL_DAYS,
} from '../../services/redis'
import * as Model from './model'

export const PlanRoutes = new Elysia({ prefix: '/plans' })
	.use(ipPlugin({ headersOnly: true }))
	.onBeforeHandle(() => {
		if (isSharingAvailable()) return

		logger.warn('redis indisponível, compartilhamento desativado')
		throw new ResponseError({
			statusCode: 503,
			error: 'o compartilhamento está indisponível no momento. tente novamente em instantes.',
		}).toResponse()
	})
	.post(
		'/',
		async ({ body, status, ip }) => {
			const retryAfter = await consumePlanShareQuota(ip || '127.0.0.1')
			if (retryAfter !== null) {
				logger.warn({ ip, retryAfter }, 'limite de links compartilhados excedido')
				throw new ResponseError({
					statusCode: 429,
					error: 'você criou muitos links na última hora. tente novamente mais tarde.',
					retryAfter,
				}).toResponse()
			}

			const created = await createSharedPlan(body)
			logger.info({ planId: created.id }, 'plano compartilhado')

			return status(201, created)
		},
		{
			body: Model.SharedPlanBody,
			response: {
				201: Model.SharedPlanCreated,
				429: ResponseErrorBody,
				503: ResponseErrorBody,
			},
			detail: {
				tags: ['plans'],
				summary: 'Cria um link para o plano',
				description: [
					`Guarda o plano (assunto, tópicos e duração dos blocos) por ${PLAN_TTL_DAYS} dias e devolve um ID curto para montar o link.`,
					'',
					`- **429**: o IP criou mais de ${MAX_PLAN_SHARES_PER_HOUR} links na última hora; \`retryAfter\` e o header \`Retry-After\` dizem quantos segundos faltam.`,
					'- **503**: o Redis está fora do ar.',
				].join('\n'),
			},
		},
	)
	.get(
		'/:id',
		async ({ params, status }) => {
			const plan = await getSharedPlan(params.id)
			if (!plan) throw new ResponseError({ statusCode: 404, error: 'este link expirou ou não existe.' }).toResponse()

			return status(200, plan)
		},
		{
			params: Model.PlanIdParams,
			response: {
				200: Model.SharedPlanResponse,
				404: ResponseErrorBody,
				503: ResponseErrorBody,
			},
			detail: {
				tags: ['plans'],
				summary: 'Abre um plano compartilhado',
				description: ['- **404**: o link expirou ou nunca existiu.', '- **503**: o Redis está fora do ar.'].join('\n'),
			},
		},
	)
