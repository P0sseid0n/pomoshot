import { Elysia } from 'elysia'
import { pino } from 'pino'

const isProduction = process.env.NODE_ENV === 'production'

// Em produção a saída é JSON (uma linha por evento), fácil de filtrar no PM2.
// Em desenvolvimento usa o pino-pretty, carregado só aqui por ser dependência de dev.
const prettyStream = isProduction
	? undefined
	: (await import('pino-pretty')).default({ colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' })

export const logger = pino(
	{
		level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
		formatters: { level: label => ({ level: label }) },
		timestamp: pino.stdTimeFunctions.isoTime,
	},
	prettyStream,
)

const startedAt = new WeakMap<Request, number>()

const getStatus = (response: unknown, fallback: unknown) => {
	if (response instanceof Response) return response.status
	if (typeof response === 'object' && response !== null && 'code' in response && typeof response.code === 'number') return response.code
	return typeof fallback === 'number' ? fallback : 200
}

const getImageCount = (body: unknown) => {
	if (typeof body !== 'object' || body === null || !('images' in body)) return undefined
	const { images } = body
	return Array.isArray(images) ? images.length : images ? 1 : 0
}

export const requestLogger = new Elysia({ name: 'request-logger' })
	.onRequest(({ request }) => {
		startedAt.set(request, performance.now())
	})
	.onAfterResponse({ as: 'global' }, context => {
		const { request, route, body, set, responseValue } = context
		const start = startedAt.get(request)
		const status = getStatus(responseValue, set.status)

		const fields = {
			ip: 'ip' in context ? context.ip || undefined : undefined,
			method: request.method,
			route: route || new URL(request.url).pathname,
			imageCount: getImageCount(body),
			status,
			durationMs: start === undefined ? undefined : Math.round(performance.now() - start),
		}

		if (status >= 500) logger.error(fields, 'requisição concluída')
		else if (status >= 400) logger.warn(fields, 'requisição concluída')
		else logger.info(fields, 'requisição concluída')
	})
