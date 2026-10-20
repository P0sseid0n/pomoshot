import { logger } from '../lib/logger'
import { redisClient } from '../lib/redis'
import type * as Type from '../types'

const ONE_HOUR_IN_SECONDS = 3600

const pomoKey = (ip: string) => `pomo:${ip}`

/** Executa um comando no Redis, ou devolve `fallback` se ele estiver indisponível (sem rate limit). */
const withRedis = async <T>(fallback: T, command: () => Promise<T>) => {
	if (!redisClient.isReady) return fallback

	try {
		return await command()
	} catch (err) {
		logger.warn({ err }, 'falha no comando do redis, seguindo sem rate limit')
		return fallback
	}
}

export const getCachedPomo = (ip: string) =>
	withRedis(null, async () => {
		const result = await redisClient.get(pomoKey(ip))

		return result ? (JSON.parse(result) as Type.LessonCachedData) : null
	})

/** Segundos até liberar um novo pomodoro para o IP, ou `null` se não houver limite ativo. */
export const getRateLimitTtl = (ip: string) =>
	withRedis(null, async () => {
		const ttl = await redisClient.ttl(pomoKey(ip))

		// -2: a chave não existe; -1: existe sem expiração (não deveria acontecer)
		if (ttl === -2) return null
		return Math.max(ttl, 0)
	})

export const setCachedPomo = (ip: string, data: Type.LessonCachedData) =>
	withRedis(undefined, async () => {
		await redisClient.setEx(pomoKey(ip), ONE_HOUR_IN_SECONDS, JSON.stringify(data))
	})
