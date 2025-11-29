import Button from '../ui/Button'
import Logo from '../ui/Logo'

export default function StartScreen({ onStart }: { onStart: () => void }) {
	return (
		<>
			<Logo className="text-6xl" />
			<p className="mt-6 mb-16 text-base text-neutral-500 max-w-lg text-center">
				transforme suas capturas de tela em um plano de estudo estruturado e acionável com inteligência artificial.
			</p>
			<Button onClick={onStart}>criar pomodoro</Button>
		</>
	)
}
