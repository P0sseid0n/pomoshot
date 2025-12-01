import { useEffect, useState } from 'react'

const ACTION_TEXTS = [
	'lendo titulos das aulas',
	'criando pomodoro com os dados',
	'calculando tempo de foco',
	'analisando conteúdo',
	'extraindo informações',
]

export default function ProcessingScreen() {
	const [actionText, setActionText] = useState(ACTION_TEXTS[0])

	useEffect(() => {
		const interval = setInterval(() => {
			setActionText(prev => {
				let next = prev

				while (next === prev) {
					next = ACTION_TEXTS[Math.floor(Math.random() * ACTION_TEXTS.length)]
				}

				return next
			})
		}, 5_000)

		return () => clearInterval(interval)
	}, [])

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-6 fade-in">
			<div className="relative w-24 h-24 mb-8">
				<div className="absolute inset-0 border-4 border-neutral-100 rounded-full"></div>
				<div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
			</div>
			<h2 className="text-2xl font-medium text-neutral-900 animate-pulse">processando imagens...</h2>
			<p className="text-neutral-400 mt-2 text-base">{actionText}</p>
		</div>
	)
}
