import type { LessonData, PomodoroSession } from '../types'

export const formatMinutes = (total: number) => {
	const hours = Math.floor(total / 60)
	const minutes = total % 60
	if (!hours) return `${minutes}m`
	return `${hours}h ${minutes.toString().padStart(2, '0')}m`
}

export const generateSessionsData = ({
	focoDuration,
	breakDuration,
	lessonData,
}: {
	focoDuration: number
	breakDuration: number
	lessonData: LessonData
}): PomodoroSession[] => {
	const { lessons } = lessonData

	// blocos de foco a partir do tempo de aula; o último pode ser mais curto
	const focusDurations: number[] = []
	for (let remaining = lessonData.totalMinutes; remaining > 0; remaining -= focoDuration)
		focusDurations.push(Math.min(remaining, focoDuration))

	// nenhum tópico fica sem bloco: se faltar, a sessão ganha blocos cheios em vez de cortar conteúdo
	while (focusDurations.length < lessons.length) focusDurations.unshift(focoDuration)

	// tópicos em sequência, cada um com pelo menos um bloco; os blocos que sobram vão para os primeiros tópicos
	const base = lessons.length ? Math.floor(focusDurations.length / lessons.length) : 0
	const extra = lessons.length ? focusDurations.length % lessons.length : 0
	const labels = lessons.flatMap((lesson, i) => Array<string>(base + (i < extra ? 1 : 0)).fill(lesson))

	const generatedSessions: PomodoroSession[] = []
	focusDurations.forEach((duration, i) => {
		if (i > 0)
			generatedSessions.push({ id: generatedSessions.length, type: 'break', duration: breakDuration, label: 'pausa regenerativa' })

		generatedSessions.push({ id: generatedSessions.length, type: 'focus', duration, label: labels[i] ?? `estudo parte ${i + 1}` })
	})
	return generatedSessions
}
