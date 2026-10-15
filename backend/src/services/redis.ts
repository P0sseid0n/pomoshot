import { redisClient } from '../lib/redis'
import type * as Type from '../types'

const ONE_HOUR_IN_SECONDS = 3600

const pomoKey = (ip: string) => `pomo:${ip}`

export const getCachedPomo = async (ip: string) => {
	const result = await redisClient.get(pomoKey(ip))

	return result ? (JSON.parse(result) as Type.LessonCachedData) : null
}

/** Segundos até liberar um novo pomodoro para o IP, ou `null` se não houver limite ativo. */
export const getRateLimitTtl = async (ip: string) => {
	const ttl = await redisClient.ttl(pomoKey(ip))

	// -2: a chave não existe; -1: existe sem expiração (não deveria acontecer)
	if (ttl === -2) return null
	return Math.max(ttl, 0)
}

export const setCachedPomo = async (ip: string, data: Type.LessonCachedData) => {
	await redisClient.setEx(pomoKey(ip), ONE_HOUR_IN_SECONDS, JSON.stringify(data))
}
