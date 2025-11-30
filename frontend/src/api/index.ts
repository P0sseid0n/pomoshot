import { treaty } from '@elysiajs/eden'
import type { App } from '@pomoshot/backend'

export const Client = treaty<App>(import.meta.env.API_URL || 'http://localhost:3000')
