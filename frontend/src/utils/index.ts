import type { LessonData, PomodoroSession } from '../types'

export const generateSessionsData = ({
	focoDuration,
	breakDuration,
	lessonData,
}: {
	focoDuration: number
	breakDuration: number
	lessonData: LessonData
}): PomodoroSession[] => {
	const generatedSessions: PomodoroSession[] = []
	let remainingMinutes = lessonData.totalMinutes
	let lessonIndex = 0

	while (remainingMinutes > 0) {
		const currentFocusDuration = Math.min(remainingMinutes, focoDuration)

		generatedSessions.push({
			id: generatedSessions.length,
			type: 'focus',
			duration: currentFocusDuration,
			label: lessonIndex < lessonData.lessons.length ? lessonData.lessons[lessonIndex] : `estudo parte ${lessonIndex + 1}`,
		})

		remainingMinutes -= currentFocusDuration
		lessonIndex++
		if (remainingMinutes > 0) {
			generatedSessions.push({
				id: generatedSessions.length,
				type: 'break',
				duration: breakDuration,
				label: 'pausa regenerativa',
			})
		}
	}
	return generatedSessions
}
