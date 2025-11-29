import axios from 'axios'

const api = axios.create({
	baseURL: import.meta.env.API_URL || 'http://localhost:3000',
})

export default {
	extractLessons: async (images: File[]) => {
		const body = new FormData()

		images.forEach(image => {
			body.append('image', image)
		})

		return api.post('/lessons/extract', body)
	},
}
