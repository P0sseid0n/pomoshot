import { useState } from 'react'
import type { LessonData } from './types'
import StartScreen from './components/screens/StartScreen'
import UploadScreen from './components/screens/UploadScreen'
import ProcessingScreen from './components/screens/ProcessingScreen'

const AppStage = {
	WELCOME: 0,
	UPLOAD: 1,
	PROCESSING: 2,
	CONFIG: 3,
	SCHEDULE: 4,
} as const
type AppStage = (typeof AppStage)[keyof typeof AppStage]

function AppContainer({ children }: { children: React.ReactNode }) {
	return <div className="h-screen max-w-4xl mx-auto flex flex-col items-center justify-center">{children}</div>
}

function App() {
	const [stage, setStage] = useState<AppStage>(AppStage.WELCOME)
	const [lessonData, setLessonData] = useState<LessonData>()

	if (stage === AppStage.WELCOME) {
		return (
			<AppContainer>
				<StartScreen onStart={() => setStage(AppStage.UPLOAD)} />
			</AppContainer>
		)
	} else if (stage === AppStage.UPLOAD) {
		return (
			<AppContainer>
				<UploadScreen
					onProcessing={isProcessing => setStage(isProcessing ? AppStage.PROCESSING : AppStage.UPLOAD)}
					onNextStage={data => {
						setStage(AppStage.CONFIG)
						setLessonData(data)
					}}
					onBackStage={() => setStage(AppStage.WELCOME)}
				/>
			</AppContainer>
		)
	} else if (stage === AppStage.PROCESSING) {
		return (
			<AppContainer>
				<ProcessingScreen />
			</AppContainer>
		)
	} else {
		return (
			<AppContainer>
				<div>outras telas em breve...</div>
			</AppContainer>
		)
	}
}

export default App
