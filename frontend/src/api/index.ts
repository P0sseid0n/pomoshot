import { treaty } from '@elysiajs/eden'
import type { App } from '@pomoshot/backend'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) throw new Error('VITE_API_URL não definida')

export const Client = treaty<App>(API_URL)
