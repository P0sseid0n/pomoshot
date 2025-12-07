import { Elysia } from 'elysia'
import { ip } from 'elysia-ip'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { isIpRateLimited } from './services/rate-limit'
import { LessonRoutes } from './modules/lessons'
import { ResponseError } from './errors/ResponseError'

export const App = new Elysia()
	.use(ip({ headersOnly: true }))
	.use(cors())
	.use(openapi())
	.error({ ResponseError })

	.onBeforeHandle(async ({ ip = '127.0.0.1' }) => {
		if (await isIpRateLimited(ip)) {
			console.log(`❌ Rate limit exceeded for IP: ${ip}`)
			throw new ResponseError({ statusCode: 429 }).toResponse()
		} else {
			console.log(`📡 Request from IP: ${ip}`)
		}
	})

	.use(LessonRoutes)

	.listen(
		{
			port: 3000,
			hostname: '0.0.0.0',
		},
		server => {
			console.log(`🦊 Elysia is running at ${server.hostname}:${server.port}`)
		}
	)

export type App = typeof App
