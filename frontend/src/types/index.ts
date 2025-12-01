import type { Treaty } from '@elysiajs/eden'
import type { Client } from '../api'

export type LessonData = Treaty.Data<typeof Client.lessons.extract.post>

export interface PomodoroSession {
	id: number
	type: 'focus' | 'break'
	duration: number
	label: string
}

export const ScreenStage = {
	WELCOME: 0,
	UPLOAD: 1,
	PROCESSING: 2,
	SETUP: 3,
	POMODORO: 4,
} as const
export type ScreenStage = (typeof ScreenStage)[keyof typeof ScreenStage]
