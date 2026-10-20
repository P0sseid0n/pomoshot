import type { Treaty } from '@elysiajs/eden'

import type { Client } from '../api'

export type LessonData = Treaty.Data<typeof Client.lessons.extract.post>

export type SharedPlan = Treaty.Data<ReturnType<typeof Client.plans>['get']>

export interface PomodoroSession {
	id: number
	type: 'focus' | 'break'
	duration: number
	label: string
}

export const ScreenStage = {
	WELCOME: 0,
	UPLOAD: 1,
	SETUP: 2,
	POMODORO: 3,
	SHARED: 4,
} as const
export type ScreenStage = (typeof ScreenStage)[keyof typeof ScreenStage]
