import { logger } from '../lib/logger'
import { redisClient } from '../lib/redis'
import type * as Type from '../types'
import { generateId } from '../utils'

const ONE_HOUR_IN_SECONDS = 3600

export const PLAN_TTL_DAYS = 7
const PLAN_TTL_SECONDS = PLAN_TTL_DAYS * 24 * ONE_HOUR_IN_SECONDS
const PLAN_ID_LENGTH = 8
export const MAX_PLAN_SHARES_PER_HOUR = 30

const pomoKey = (ip: string) => `pomo:${ip}`
const planKey = (id: string) => `plan:${id}`
const planShareKey = (ip: string) => `plan-share:${ip}`

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

/** Conta um link criado pelo IP. Devolve os segundos até liberar novos links, ou `null` se ainda houver cota. */
export const consumePlanShareQuota = (ip: string) =>
	withRedis(null, async () => {
		const key = planShareKey(ip)
		const count = await redisClient.incr(key)
		if (count === 1) await redisClient.expire(key, ONE_HOUR_IN_SECONDS)

		if (count <= MAX_PLAN_SHARES_PER_HOUR) return null
		return Math.max(await redisClient.ttl(key), 0)
	})

// Os planos compartilhados só existem no Redis, então aqui não há fallback: as rotas
// respondem 503 antes de chegar nessas funções quando ele está fora do ar.
export const isSharingAvailable = () => redisClient.isReady

export const createSharedPlan = async (plan: Type.SharedPlan) => {
	// colisão é improvável (32^8 IDs), mas o NX garante que um plano nunca sobrescreve outro
	for (let attempt = 0; attempt < 5; attempt++) {
		const id = generateId(PLAN_ID_LENGTH)
		const saved = await redisClient.set(planKey(id), JSON.stringify(plan), {
			condition: 'NX',
			expiration: { type: 'EX', value: PLAN_TTL_SECONDS },
		})

		if (saved) return { id, expiresAt: Date.now() + PLAN_TTL_SECONDS * 1000 }
	}

	throw new Error('não foi possível gerar um ID livre para o plano')
}

export const getSharedPlan = async (id: string) => {
	const [result, ttl] = await Promise.all([redisClient.get(planKey(id)), redisClient.ttl(planKey(id))])
	if (!result) return null

	const plan = JSON.parse(result) as Type.SharedPlan
	return { ...plan, expiresAt: Date.now() + Math.max(ttl, 0) * 1000 }
}
