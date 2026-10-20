import { createClient } from 'redis'

import { logger } from './logger'

export const redisClient = createClient({
	url: process.env.REDIS_URL,
})

// Evita repetir o aviso a cada tentativa de reconexão do node-redis.
let unavailableWarned = false

redisClient.on('error', err => {
	if (unavailableWarned) return
	unavailableWarned = true
	logger.warn({ err }, '⚠️ Redis indisponível, rate limit desativado')
})

redisClient.on('ready', () => {
	unavailableWarned = false
	logger.info('redis conectado')
})

/**
 * Conecta ao Redis sem bloquear a inicialização: se ele estiver fora do ar,
 * a API sobe sem rate limit e o node-redis segue tentando reconectar.
 */
export const connectRedis = () => {
	redisClient.connect().catch(err => {
		logger.error({ err }, 'não foi possível conectar ao redis')
	})
}
