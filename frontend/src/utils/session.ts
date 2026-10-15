import type { LessonData } from '../types'

const STORAGE_KEY = 'pomoshot:session'

export interface PomodoroProgress {
	currentSessionIndex: number
	timeLeft: number
}

export interface SavedSession {
	lessonData: LessonData
	pomodoro?: PomodoroProgress & {
		focoDuration: number
		breakDuration: number
	}
	savedAt: number
}

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

const isSavedSession = (value: unknown): value is SavedSession => {
	if (typeof value !== 'object' || value === null) return false

	const { lessonData, pomodoro } = value as Partial<SavedSession>
	if (
		typeof lessonData !== 'object' ||
		lessonData === null ||
		typeof lessonData.title !== 'string' ||
		!isNumber(lessonData.totalMinutes) ||
		!Array.isArray(lessonData.lessons) ||
		!lessonData.lessons.every(lesson => typeof lesson === 'string')
	)
		return false

	if (pomodoro === undefined) return true

	return (
		isNumber(pomodoro.focoDuration) &&
		isNumber(pomodoro.breakDuration) &&
		isNumber(pomodoro.currentSessionIndex) &&
		isNumber(pomodoro.timeLeft)
	)
}

export const loadSession = (): SavedSession | null => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return null

		const parsed: unknown = JSON.parse(raw)
		return isSavedSession(parsed) ? parsed : null
	} catch {
		return null
	}
}

export const saveSession = (session: Omit<SavedSession, 'savedAt'>) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...session, savedAt: Date.now() }))
	} catch {
		// armazenamento indisponível (aba anônima, cota cheia): segue sem salvar
	}
}

export const updateSessionProgress = (progress: PomodoroProgress) => {
	const session = loadSession()
	if (!session?.pomodoro) return

	saveSession({ ...session, pomodoro: { ...session.pomodoro, ...progress } })
}

export const clearSession = () => {
	try {
		localStorage.removeItem(STORAGE_KEY)
	} catch {
		// ignora
	}
}
