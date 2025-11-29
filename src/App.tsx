import { useState } from 'react'
import StartScreen from './components/screens/StartScreen'
import UploadScreen from './components/screens/UploadScreen'

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
					onNextStage={() => {
						setStage(AppStage.PROCESSING)
					}}
					onBackStage={() => setStage(AppStage.WELCOME)}
				/>
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
