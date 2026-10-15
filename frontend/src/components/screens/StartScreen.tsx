import { useState } from 'react'

import { generateSessionsData } from '../../utils'
import { loadSession, type SavedSession } from '../../utils/session'
import ArrowRightIcon from '../icons/ArrowRight'
import Button from '../ui/Button'
import Footer from '../ui/Footer'
import Logo from '../ui/Logo'

const STEPS = ['capture os slides', 'a ia lê os títulos das aulas', 'estude em blocos de foco']

const describeProgress = ({ lessonData, pomodoro }: SavedSession) => {
	if (!pomodoro) return 'plano pronto, falta configurar os blocos'

	const total = generateSessionsData({ ...pomodoro, lessonData }).length
	return `bloco ${Math.min(pomodoro.currentSessionIndex + 1, total)} de ${total}`
}

export default function StartScreen({ onStart, onResume }: { onStart: () => void; onResume: (session: SavedSession) => void }) {
	const [savedSession] = useState(loadSession)

	return (
		<>
			<div
				aria-hidden
				className="pointer-events-none fixed inset-x-0 top-0 h-[70dvh] bg-[radial-gradient(ellipse_60%_55%_at_50%_0%,var(--accent-soft),transparent_70%)] opacity-70"
			/>

			<main className="relative flex-1 flex flex-col items-center justify-center text-center pb-8">
				<Logo className="text-6xl md:text-8xl animate-rise" />

				<p className="max-w-[26ch] md:max-w-[32ch] mt-8 text-lg md:text-xl leading-relaxed text-ink-muted animate-rise stagger-1">
					transforme capturas de tela das suas aulas em um plano de estudo <span className="text-ink font-medium">pomodoro</span>,
					pronto pra começar.
				</p>

				{savedSession ? (
					<div className="mt-12 flex flex-col items-center animate-rise stagger-2">
						<div className="flex flex-col sm:flex-row gap-3">
							<Button onClick={() => onResume(savedSession)} className="group">
								continuar de onde parou
								<span className="transition-transform duration-300 ease-spring group-hover:translate-x-0.5">
									<ArrowRightIcon />
								</span>
							</Button>
							<Button variant="secondary" onClick={onStart}>
								criar novo pomodoro
							</Button>
						</div>
						<p className="mt-4 max-w-[40ch] text-sm text-ink-faint">
							<span className="text-ink-muted">{savedSession.lessonData.title.toLowerCase()}</span> ·{' '}
							{describeProgress(savedSession)}
						</p>
					</div>
				) : (
					<div className="mt-12 animate-rise stagger-2">
						<Button onClick={onStart} className="group">
							criar pomodoro
							<span className="transition-transform duration-300 ease-spring group-hover:translate-x-0.5">
								<ArrowRightIcon />
							</span>
						</Button>
					</div>
				)}

				<ol className="mt-20 flex flex-col md:flex-row gap-3 md:gap-8 text-sm text-ink-faint animate-rise stagger-3">
					{STEPS.map((step, i) => (
						<li key={step} className="flex items-baseline gap-2">
							<span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
							{step}
						</li>
					))}
				</ol>
			</main>

			<Footer />
		</>
	)
}
