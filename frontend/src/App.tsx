import { useState } from 'react'
import { type LessonData, ScreenStage } from './types'
import StartScreen from './components/screens/StartScreen'
import UploadScreen from './components/screens/UploadScreen'
import ProcessingScreen from './components/screens/ProcessingScreen'
import SetupScreen from './components/screens/SetupScreen'
import PomodoroScreen from './components/screens/PomodoroScreen'

function App() {
	const [stage, setStage] = useState<ScreenStage>(ScreenStage.WELCOME)
	const [lessonData, setLessonData] = useState<LessonData>()
	const [focoDuration, setFocoDuration] = useState<number>()
	const [breakDuration, setBreakDuration] = useState<number>()

	const screens = {
		[ScreenStage.WELCOME]: <StartScreen onStart={() => setStage(ScreenStage.UPLOAD)} />,
		[ScreenStage.UPLOAD]: (
			<UploadScreen
				onProcessing={isProcessing => setStage(isProcessing ? ScreenStage.PROCESSING : ScreenStage.UPLOAD)}
				onNextStage={data => {
					setStage(ScreenStage.SETUP)
					setLessonData(data)
				}}
				onReset={() => setStage(ScreenStage.WELCOME)}
				onBackStage={() => setStage(ScreenStage.WELCOME)}
			/>
		),
		[ScreenStage.PROCESSING]: <ProcessingScreen />,
		[ScreenStage.SETUP]: (
			<SetupScreen
				lessonData={lessonData!}
				onStartSession={(focoDuration, breakDuration) => {
					setFocoDuration(focoDuration)
					setBreakDuration(breakDuration)
					setStage(ScreenStage.POMODORO)
				}}
				onReset={() => setStage(ScreenStage.WELCOME)}
			/>
		),
		[ScreenStage.POMODORO]: (
			<PomodoroScreen
				lessonData={lessonData!}
				focoDuration={focoDuration!}
				breakDuration={breakDuration!}
				onReset={() => setStage(ScreenStage.WELCOME)}
			/>
		),
	}

	return <div className="h-screen max-w-4xl mx-auto">{screens[stage]}</div>
}

export default App
