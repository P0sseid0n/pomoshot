import { useState } from 'react'

import PomodoroScreen from './components/screens/PomodoroScreen'
import SetupScreen from './components/screens/SetupScreen'
import StartScreen from './components/screens/StartScreen'
import UploadScreen from './components/screens/UploadScreen'
import { ScreenStage, type LessonData } from './types'
import { saveSession, type PomodoroProgress, type SavedSession } from './utils/session'

function App() {
	const [stage, setStage] = useState<ScreenStage>(ScreenStage.WELCOME)
	const [lessonData, setLessonData] = useState<LessonData>()
	const [focoDuration, setFocoDuration] = useState<number>()
	const [breakDuration, setBreakDuration] = useState<number>()
	const [initialProgress, setInitialProgress] = useState<PomodoroProgress>()

	const handleResume = ({ lessonData, pomodoro }: SavedSession) => {
		setLessonData(lessonData)

		if (!pomodoro) return setStage(ScreenStage.SETUP)

		setFocoDuration(pomodoro.focoDuration)
		setBreakDuration(pomodoro.breakDuration)
		setInitialProgress({ currentSessionIndex: pomodoro.currentSessionIndex, timeLeft: pomodoro.timeLeft })
		setStage(ScreenStage.POMODORO)
	}

	const screens = {
		[ScreenStage.WELCOME]: <StartScreen onStart={() => setStage(ScreenStage.UPLOAD)} onResume={handleResume} />,
		[ScreenStage.UPLOAD]: (
			<UploadScreen
				onNextStage={data => {
					saveSession({ lessonData: data })
					setStage(ScreenStage.SETUP)
					setLessonData(data)
				}}
				onReset={() => setStage(ScreenStage.WELCOME)}
				onBackStage={() => setStage(ScreenStage.WELCOME)}
			/>
		),
		[ScreenStage.SETUP]: (
			<SetupScreen
				lessonData={lessonData!}
				onStartSession={(focoDuration, breakDuration) => {
					saveSession({
						lessonData: lessonData!,
						pomodoro: { focoDuration, breakDuration, currentSessionIndex: 0, timeLeft: focoDuration * 60 },
					})
					setFocoDuration(focoDuration)
					setBreakDuration(breakDuration)
					setInitialProgress(undefined)
					setStage(ScreenStage.POMODORO)
				}}
				onBackStage={() => setStage(ScreenStage.UPLOAD)}
				onReset={() => setStage(ScreenStage.WELCOME)}
			/>
		),
		[ScreenStage.POMODORO]: (
			<PomodoroScreen
				lessonData={lessonData!}
				focoDuration={focoDuration!}
				breakDuration={breakDuration!}
				initialProgress={initialProgress}
				onReset={() => setStage(ScreenStage.WELCOME)}
			/>
		),
	}

	return (
		<div key={stage} className="min-h-dvh max-w-4xl mx-auto px-5 py-5 md:px-8 md:py-6 flex flex-col">
			{screens[stage]}
		</div>
	)
}

export default App
