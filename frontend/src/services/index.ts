import { treaty } from '@elysiajs/eden'
import type { App } from '@pomoshot/backend'

const client = treaty<App>(import.meta.env.API_URL || 'http://localhost:3000')

export default {
	extractLessons: (image: File[]) => {
		return client.lessons.extract.post({ image })
	},
}
