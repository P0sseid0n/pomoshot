// O plano vai na query (/?p=<id>) e não no caminho, para o link abrir em qualquer servidor estático sem fallback de SPA.
const SHARE_PARAM = 'p'

// Espelho de PLAN_TTL_DAYS em backend/src/services/redis.ts — mantenha os dois em sincronia.
export const SHARE_TTL_DAYS = 7

const DAY_IN_MS = 24 * 60 * 60 * 1000

export const getSharedPlanId = () => new URLSearchParams(window.location.search).get(SHARE_PARAM) || undefined

export const clearSharedPlanId = () => {
	const url = new URL(window.location.href)
	if (!url.searchParams.has(SHARE_PARAM)) return

	url.searchParams.delete(SHARE_PARAM)
	window.history.replaceState(null, '', url)
}

export const buildShareUrl = (id: string) => {
	const url = new URL('/', window.location.origin)
	url.searchParams.set(SHARE_PARAM, id)
	return url.toString()
}

/** Dias que faltam até `expiresAt`, arredondando para cima (mínimo 1). */
export const daysUntil = (expiresAt: number) => Math.max(1, Math.ceil((expiresAt - Date.now()) / DAY_IN_MS))

export const formatDays = (days: number) => `${days} ${days === 1 ? 'dia' : 'dias'}`

/** Extrai a mensagem de um erro do Eden, com um texto padrão quando a resposta não traz uma. */
export const describeApiError = (error: { value: unknown }, fallback: string) => {
	const { value } = error
	if (typeof value === 'object' && value !== null && 'error' in value && typeof value.error === 'string') return value.error
	return fallback
}
