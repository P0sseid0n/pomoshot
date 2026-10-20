import { useState } from 'react'

import { Client } from '../api'
import type { LessonData } from '../types'
import { buildShareUrl, daysUntil, describeApiError } from '../utils/share'

export type ShareLink =
	{ status: 'loading' } | { status: 'ready'; url: string; expiresInDays: number } | { status: 'error'; message: string }

/**
 * Cria o link de compartilhamento do plano sob demanda e guarda um link por versão do plano (tópicos, foco e pausa),
 * para não criar um novo a cada vez que o diálogo abre.
 */
export const useShareLink = (lessonData: LessonData, focoDuration: number, breakDuration: number) => {
	const [links, setLinks] = useState<Record<string, ShareLink>>({})
	// o plano entra na chave porque os tópicos e o tempo podem ser editados antes de compartilhar
	const key = JSON.stringify([lessonData, focoDuration, breakDuration])

	const share = async () => {
		const current = links[key]
		if (current && current.status !== 'error') return

		setLinks(prev => ({ ...prev, [key]: { status: 'loading' } }))

		let link: ShareLink
		try {
			const { data, error } = await Client.plans.post({ lessonData, focoDuration, breakDuration })
			link = error
				? { status: 'error', message: describeApiError(error, 'não foi possível criar o link.') }
				: { status: 'ready', url: buildShareUrl(data.id), expiresInDays: daysUntil(data.expiresAt) }
		} catch {
			link = { status: 'error', message: 'não foi possível criar o link. verifique sua conexão.' }
		}

		setLinks(prev => ({ ...prev, [key]: link }))
	}

	return { link: links[key], share }
}
