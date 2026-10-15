import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'
import { ip } from 'elysia-ip'

import { ResponseError } from './errors/ResponseError'
import { LessonRoutes } from './modules/lessons'
import { getCachedPomo } from './services/redis'

export const App = new Elysia()
	.use(ip({ headersOnly: true }))
	.use(cors({ origin: process.env.CORS_ORIGIN ?? true }))
	.use(openapi())
	.error({ ResponseError })

	.onBeforeHandle(async ({ ip }) => {
		ip ||= '127.0.0.1'

		if (await getCachedPomo(ip)) {
			console.log(`❌ Rate limit exceeded for IP: ${ip}`)
			throw new ResponseError({ statusCode: 429, error: 'Rate limit exceeded' }).toResponse()
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
		},
	)

export type App = typeof App
