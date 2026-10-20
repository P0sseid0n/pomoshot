import { useState } from 'react'

import PomodoroScreen from './components/screens/PomodoroScreen'
import SetupScreen from './components/screens/SetupScreen'
import SharedPlanScreen from './components/screens/SharedPlanScreen'
import StartScreen from './components/screens/StartScreen'
import UploadScreen from './components/screens/UploadScreen'
import { ScreenStage, type LessonData, type SharedPlan } from './types'
import { saveSession, type PomodoroProgress, type SavedSession } from './utils/session'
import { clearSharedPlanId, getSharedPlanId } from './utils/share'

function App() {
	const [sharedPlanId] = useState(getSharedPlanId)
	const [stage, setStage] = useState<ScreenStage>(sharedPlanId ? ScreenStage.SHARED : ScreenStage.WELCOME)
	const [lessonData, setLessonData] = useState<LessonData>()
	const [focoDuration, setFocoDuration] = useState<number>()
	const [breakDuration, setBreakDuration] = useState<number>()
	const [initialProgress, setInitialProgress] = useState<PomodoroProgress>()

	// o link compartilhado só vale até a pessoa sair da tela dele; depois, recarregar a página não deve reabri-lo
	const goTo = (next: ScreenStage) => {
		clearSharedPlanId()
		setStage(next)
	}

	const handleResume = ({ lessonData, pomodoro }: SavedSession) => {
		setLessonData(lessonData)

		if (!pomodoro) return goTo(ScreenStage.SETUP)

		setFocoDuration(pomodoro.focoDuration)
		setBreakDuration(pomodoro.breakDuration)
		setInitialProgress({ currentSessionIndex: pomodoro.currentSessionIndex, timeLeft: pomodoro.timeLeft })
		goTo(ScreenStage.POMODORO)
	}

	const startSession = (lessonData: LessonData, focoDuration: number, breakDuration: number) => {
		saveSession({
			lessonData,
			pomodoro: { focoDuration, breakDuration, currentSessionIndex: 0, timeLeft: focoDuration * 60 },
		})
		setLessonData(lessonData)
		setFocoDuration(focoDuration)
		setBreakDuration(breakDuration)
		setInitialProgress(undefined)
		goTo(ScreenStage.POMODORO)
	}

	const handleAdjustSharedPlan = ({ lessonData, focoDuration, breakDuration }: SharedPlan) => {
		saveSession({ lessonData })
		setLessonData(lessonData)
		setFocoDuration(focoDuration)
		setBreakDuration(breakDuration)
		goTo(ScreenStage.SETUP)
	}

	const screens = {
		[ScreenStage.WELCOME]: <StartScreen onStart={() => goTo(ScreenStage.UPLOAD)} onResume={handleResume} />,
		[ScreenStage.UPLOAD]: (
			<UploadScreen
				onNextStage={data => {
					saveSession({ lessonData: data })
					setStage(ScreenStage.SETUP)
					setLessonData(data)
				}}
				onReset={() => goTo(ScreenStage.WELCOME)}
				onBackStage={() => goTo(ScreenStage.WELCOME)}
			/>
		),
		[ScreenStage.SETUP]: (
			<SetupScreen
				lessonData={lessonData!}
				initialFocoDuration={focoDuration}
				initialBreakDuration={breakDuration}
				onStartSession={(focoDuration, breakDuration) => startSession(lessonData!, focoDuration, breakDuration)}
				onBackStage={() => goTo(ScreenStage.UPLOAD)}
				onReset={() => goTo(ScreenStage.WELCOME)}
			/>
		),
		[ScreenStage.POMODORO]: (
			<PomodoroScreen
				lessonData={lessonData!}
				focoDuration={focoDuration!}
				breakDuration={breakDuration!}
				initialProgress={initialProgress}
				onReset={() => goTo(ScreenStage.WELCOME)}
			/>
		),
		[ScreenStage.SHARED]: (
			<SharedPlanScreen
				planId={sharedPlanId!}
				onStart={plan => startSession(plan.lessonData, plan.focoDuration, plan.breakDuration)}
				onAdjust={handleAdjustSharedPlan}
				onCreate={() => goTo(ScreenStage.UPLOAD)}
				onReset={() => goTo(ScreenStage.WELCOME)}
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
