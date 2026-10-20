import { App } from './app'
import { logger } from './lib/logger'
import { connectRedis } from './lib/redis'

connectRedis()

App.listen(
	{
		port: 3000,
		hostname: '0.0.0.0',
	},
	server => {
		logger.info({ hostname: server.hostname, port: server.port }, 'servidor iniciado')
	},
)

export type App = typeof App
