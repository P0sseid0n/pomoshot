import Button from '../ui/Button'
import Logo from '../ui/Logo'

export default function StartScreen({ onStart }: { onStart: () => void }) {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-6 fade-in text-center">
			<Logo className="text-6xl mb-10 scale-150" />
			<p className="max-w-md text-neutral-500 mb-12 text-lg leading-relaxed ">
				transforme suas capturas de tela em um plano de estudo <span className="text-red-500 font-medium">pomodoro</span>{' '}
				estruturado com ia.
			</p>
			<Button onClick={onStart}>criar pomodoro</Button>
		</div>
	)
}
