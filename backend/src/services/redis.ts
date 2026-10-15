import { redisClient } from '../lib/redis'
import type * as Type from '../types'

const ONE_HOUR_IN_SECONDS = 3600

const pomoKey = (ip: string) => `pomo:${ip}`

export const getCachedPomo = async (ip: string) => {
	const result = await redisClient.get(pomoKey(ip))

	return result ? (JSON.parse(result) as Type.LessonCachedData) : null
}

export const setCachedPomo = async (ip: string, data: Type.LessonCachedData) => {
	await redisClient.setEx(pomoKey(ip), ONE_HOUR_IN_SECONDS, JSON.stringify(data))
}
