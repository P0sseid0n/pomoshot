import { App } from './app'
import { logger } from './lib/logger'
import { redisClient } from './lib/redis'

await redisClient.connect()

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
