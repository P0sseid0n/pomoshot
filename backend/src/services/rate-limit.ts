import { redisClient } from '../lib/redis'

export const isIpRateLimited = async (ip: string) => {
	const ONE_HOUR_IN_SECONDS = 3600
	const result = await redisClient.set(ip, Date.now(), {
		expiration: {
			type: 'EX',
			value: ONE_HOUR_IN_SECONDS,
		},
		condition: 'NX',
	})

	return result === null
}
